import { range } from "lib/system/range";

import { JsonRpcRequest, JsonRpcResponse } from "./types";
import type { InpageProvider } from "./provider";

const TIMEOUT = 5 * 60_000; // 5 minutes
const JSONRPC_TEMPLATE = {
  jsonrpc: "2.0",
  id: 0,
} as const;

export type BlockHeight = number | "latest";

export interface FilterParam {
  fromBlock?: string;
  toBlock?: string;
  address?: string | string[];
  topics?: (string | string[])[];
}

export interface Filter {
  fromBlock: BlockHeight;
  toBlock: BlockHeight;
  addresses: string[] | null;
  topics: (string | string[])[];
}

export class FilterObserver {
  private readonly logFilters = new Map<number, Filter>(); // <id, filter>
  private readonly blockFilters = new Set<number>(); // <id>
  private readonly pendingTransactionFilters = new Set<number>(); // <id, true>
  private readonly cursors = new Map<number, number>(); // <id, cursor>
  private readonly timeouts = new Map<number, number>(); // <id, setTimeout id>
  private nextFilterId = 1;

  constructor(private readonly provider: InpageProvider) {}

  async newFilter(param: FilterParam): Promise<string> {
    const filter = filterFromParam(param);
    const id = this.makeFilterId();

    await this.setInitialCursorPosition(id, filter.fromBlock);

    this.logFilters.set(id, filter);
    this.setFilterTimeout(id);

    return hexStringFromIntNumber(id);
  }

  async newBlockFilter(): Promise<string> {
    const id = this.makeFilterId();

    await this.setInitialCursorPosition(id, "latest");

    this.blockFilters.add(id);
    this.setFilterTimeout(id);

    return hexStringFromIntNumber(id);
  }

  async newPendingTransactionFilter(): Promise<string> {
    const id = this.makeFilterId();

    await this.setInitialCursorPosition(id, "latest");

    this.pendingTransactionFilters.add(id);
    this.setFilterTimeout(id);

    return hexStringFromIntNumber(id);
  }

  uninstallFilter(filterId: string): boolean {
    const id = intNumberFromHexString(filterId);
    return this.deleteFilter(id);
  }

  getFilterChanges(filterId: string): Promise<JsonRpcResponse<unknown>> {
    const id = intNumberFromHexString(filterId);

    if (this.timeouts.has(id)) {
      this.setFilterTimeout(id);
    }

    switch (true) {
      case this.logFilters.has(id):
        return this.getLogFilterChanges(id);

      case this.blockFilters.has(id):
        return this.getBlockFilterChanges(id);

      case this.pendingTransactionFilters.has(id):
        return this.getPendingTransactionFilterChanges();

      default:
        return Promise.resolve(filterNotFoundError());
    }
  }

  async getFilterLogs(filterId: string): Promise<JsonRpcResponse<unknown>> {
    const id = intNumberFromHexString(filterId);
    const filter = this.logFilters.get(id);

    if (!filter) {
      return filterNotFoundError();
    }

    return this.sendAsyncPromise({
      ...JSONRPC_TEMPLATE,
      method: "eth_getLogs",
      params: [paramFromFilter(filter)],
    });
  }

  private makeFilterId(): number {
    return Math.floor(++this.nextFilterId);
  }

  private sendAsyncPromise<T = unknown>(
    request: JsonRpcRequest<unknown>
  ): Promise<JsonRpcResponse<T>> {
    return new Promise((resolve, reject) => {
      this.provider.sendAsync<T>(request, (err, response) => {
        if (err) {
          return reject(err);
        }

        if (Array.isArray(response) || response == null) {
          return reject(
            new Error(
              `unexpected response received: ${JSON.stringify(response)}`
            )
          );
        }

        resolve(response);
      });
    });
  }

  private deleteFilter(id: number): boolean {
    return [
      this.logFilters.delete(id),
      this.blockFilters.delete(id),
      this.pendingTransactionFilters.delete(id),
      this.cursors.delete(id),
      this.timeouts.delete(id),
    ].some(Boolean);
  }

  private async getLogFilterChanges(
    id: number
  ): Promise<JsonRpcResponse<unknown>> {
    const filter = this.logFilters.get(id);
    const cursorPosition = this.cursors.get(id);
    if (!cursorPosition || !filter) {
      return filterNotFoundError();
    }
    const currentBlockHeight = await this.getCurrentBlockHeight();
    const toBlock =
      filter.toBlock === "latest" ? currentBlockHeight : filter.toBlock;

    if (cursorPosition > currentBlockHeight) {
      return emptyResult();
    }
    if (cursorPosition > filter.toBlock) {
      return emptyResult();
    }

    const response = await this.sendAsyncPromise({
      ...JSONRPC_TEMPLATE,
      method: "eth_getLogs",
      params: [
        paramFromFilter({
          ...filter,
          fromBlock: cursorPosition,
          toBlock,
        }),
      ],
    });

    if ("result" in response && Array.isArray(response.result)) {
      const blocks = response.result.map((log) =>
        intNumberFromHexString(log.blockNumber || "0x0")
      );

      const highestBlock = Math.max(...blocks);
      if (highestBlock && highestBlock > cursorPosition) {
        const newCursorPosition = Math.floor(highestBlock + 1);
        this.cursors.set(id, newCursorPosition);
      }
    }

    return response;
  }

  private async getBlockFilterChanges(
    id: number
  ): Promise<JsonRpcResponse<unknown>> {
    const cursorPosition = this.cursors.get(id);
    if (!cursorPosition) {
      return filterNotFoundError();
    }

    const currentBlockHeight = await this.getCurrentBlockHeight();
    if (cursorPosition > currentBlockHeight) {
      return emptyResult();
    }

    const blocks = (
      await Promise.all(
        range(cursorPosition, currentBlockHeight + 1).map((i) =>
          this.getBlockHashByNumber(Math.floor(i))
        )
      )
    ).filter(Boolean);

    const newCursorPosition = Math.floor(cursorPosition + blocks.length);
    this.cursors.set(id, newCursorPosition);

    return { ...JSONRPC_TEMPLATE, result: blocks };
  }

  private async getPendingTransactionFilterChanges(): Promise<
    JsonRpcResponse<unknown>
  > {
    // pending transaction filters are not supported
    return Promise.resolve(emptyResult());
  }

  private async setInitialCursorPosition(
    id: number,
    startBlock: BlockHeight
  ): Promise<number> {
    const currentBlockHeight = await this.getCurrentBlockHeight();
    const initialCursorPosition =
      typeof startBlock === "number" && startBlock > currentBlockHeight
        ? startBlock
        : currentBlockHeight;
    this.cursors.set(id, initialCursorPosition);
    return initialCursorPosition;
  }

  private setFilterTimeout(id: number): void {
    const existing = this.timeouts.get(id);
    if (existing) {
      window.clearTimeout(existing);
    }
    const timeout = window.setTimeout(() => {
      console.info(`Filter (${id}) timed out`);
      this.deleteFilter(id);
    }, TIMEOUT);
    this.timeouts.set(id, timeout);
  }

  private async getCurrentBlockHeight(): Promise<number> {
    const res = await this.sendAsyncPromise({
      ...JSONRPC_TEMPLATE,
      method: "eth_blockNumber",
      params: [],
    });

    return "result" in res
      ? intNumberFromHexString(ensureHexString(res.result))
      : 0;
  }

  private async getBlockHashByNumber(
    blockNumber: number
  ): Promise<string | null> {
    const response = await this.sendAsyncPromise<{ hash: string }>({
      ...JSONRPC_TEMPLATE,
      method: "eth_getBlockByNumber",
      params: [hexStringFromIntNumber(blockNumber), false],
    });
    if (
      "result" in response &&
      response.result &&
      typeof response.result.hash === "string"
    ) {
      return ensureHexString(response.result.hash);
    }
    return null;
  }
}

export function filterFromParam(param: FilterParam): Filter {
  return {
    fromBlock: intBlockHeightFromHexBlockHeight(param.fromBlock),
    toBlock: intBlockHeightFromHexBlockHeight(param.toBlock),
    addresses:
      param.address === undefined
        ? null
        : Array.isArray(param.address)
        ? param.address
        : [param.address],
    topics: param.topics || [],
  };
}

function paramFromFilter(filter: Filter): FilterParam {
  const param: FilterParam = {
    fromBlock: hexBlockHeightFromIntBlockHeight(filter.fromBlock),
    toBlock: hexBlockHeightFromIntBlockHeight(filter.toBlock),
    topics: filter.topics,
  };
  if (filter.addresses !== null) {
    param.address = filter.addresses;
  }
  return param;
}

function intBlockHeightFromHexBlockHeight(value?: string): BlockHeight {
  if (value === undefined || value === "latest" || value === "pending") {
    return "latest";
  } else if (value === "earliest") {
    return Math.floor(0);
  } else if (isHexString(value)) {
    return intNumberFromHexString(value);
  }
  throw new Error(`Invalid block option: ${String(value)}`);
}

function hexBlockHeightFromIntBlockHeight(value: BlockHeight): string {
  if (value === "latest") {
    return value;
  }
  return hexStringFromIntNumber(value);
}

function filterNotFoundError(): JsonRpcResponse<unknown> {
  return {
    ...JSONRPC_TEMPLATE,
    error: { code: -32000, message: "filter not found" },
  };
}

function emptyResult(): JsonRpcResponse<unknown> {
  return { ...JSONRPC_TEMPLATE, result: [] };
}

const HEXADECIMAL_STRING_REGEX = /^[a-f0-9]*$/;

function ensureHexString(hex: unknown, includePrefix = false): string {
  if (typeof hex === "string") {
    const s = strip0x(hex).toLowerCase();
    if (HEXADECIMAL_STRING_REGEX.test(s)) {
      return includePrefix ? "0x" + s : s;
    }
  }
  throw new Error(`"${String(hex)}" is not a hexadecimal string`);
}

function intNumberFromHexString(hex: string): number {
  return Number.parseInt(ensureHexString(hex), 16);
}

function hexStringFromIntNumber(num: number): string {
  return prepend0x(num.toString(16));
}

function isHexString(hex: unknown): hex is string {
  if (typeof hex !== "string") {
    return false;
  }
  const s = strip0x(hex).toLowerCase();
  return HEXADECIMAL_STRING_REGEX.test(s);
}

function strip0x(hex: string): string {
  if (has0xPrefix(hex)) {
    return hex.slice(2);
  }
  return hex;
}

function prepend0x(hex: string): string {
  if (has0xPrefix(hex)) {
    return "0x" + hex.slice(2);
  }
  return "0x" + hex;
}

function has0xPrefix(str: string): boolean {
  return str.startsWith("0x") || str.startsWith("0X");
}
