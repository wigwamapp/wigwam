import { range } from "lib/system/range";

import type { RequestArguments } from "core/types/rpc";
import type { InpageProvider } from "./provider";

const TIMEOUT = 5 * 60_000; // 5 minutes

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

export class FilterManager {
  private readonly logFilters = new Map<number, Filter>(); // <id, filter>
  private readonly blockFilters = new Set<number>(); // <id>
  private readonly pendingTransactionFilters = new Set<number>(); // <id, true>
  private readonly cursors = new Map<number, number>(); // <id, cursor>
  private readonly timeouts = new Map<number, ReturnType<typeof setTimeout>>(); // <id, setTimeout id>
  private nextFilterId = 1;

  constructor(private readonly provider: InpageProvider) {
    this.provider.on("networkChanged", () => this.cleanupAll());
  }

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

  getFilterChanges(filterId: string, full = false): Promise<unknown> {
    const id = intNumberFromHexString(filterId);

    if (this.timeouts.has(id)) {
      this.setFilterTimeout(id);
    }

    switch (true) {
      case this.logFilters.has(id):
        return this.getLogFilterChanges(id);

      case this.blockFilters.has(id):
        return this.getBlockFilterChanges(id, full);

      case this.pendingTransactionFilters.has(id):
        return this.getPendingTransactionFilterChanges();

      default:
        return Promise.reject(filterNotFoundError());
    }
  }

  async getFilterLogs(filterId: string): Promise<unknown> {
    const id = intNumberFromHexString(filterId);
    const filter = this.logFilters.get(id);

    if (!filter) {
      throw filterNotFoundError();
    }

    return this.requestProvider({
      method: "eth_getLogs",
      params: [paramFromFilter(filter)],
    });
  }

  private makeFilterId(): number {
    return this.nextFilterId++;
  }

  private async requestProvider<T = unknown>(
    args: RequestArguments,
  ): Promise<T> {
    const result = await this.provider.request(args);
    return result as T;
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

  private cleanupAll() {
    this.logFilters.clear();
    this.blockFilters.clear();
    this.pendingTransactionFilters.clear();
    this.cursors.clear();
    this.timeouts.clear();
  }

  private async getLogFilterChanges(id: number): Promise<unknown> {
    const filter = this.logFilters.get(id);
    const cursorPosition = this.cursors.get(id);

    if (!cursorPosition || !filter) {
      throw filterNotFoundError();
    }

    const currentBlockHeight = await this.getCurrentBlockHeight();
    const toBlock =
      filter.toBlock === "latest" ? currentBlockHeight : filter.toBlock;

    if (cursorPosition > currentBlockHeight) {
      return [];
    }
    if (cursorPosition > +filter.toBlock) {
      return [];
    }

    const result = await this.requestProvider<any[]>({
      method: "eth_getLogs",
      params: [
        paramFromFilter({
          ...filter,
          fromBlock: cursorPosition,
          toBlock,
        }),
      ],
    });

    if (Array.isArray(result) && result.length > 0) {
      const blocks = result.map((log) =>
        intNumberFromHexString(log.blockNumber || "0x0"),
      );

      const highestBlock = Math.max(...blocks);
      if (highestBlock && highestBlock > cursorPosition) {
        const newCursorPosition = highestBlock + 1;
        this.cursors.set(id, newCursorPosition);
      }
    }

    return result;
  }

  private async getBlockFilterChanges(
    id: number,
    full = false,
  ): Promise<unknown> {
    const cursorPosition = this.cursors.get(id);
    if (!cursorPosition) {
      throw filterNotFoundError();
    }

    const currentBlockHeight = await this.getCurrentBlockHeight();
    if (cursorPosition > currentBlockHeight) {
      return [];
    }

    const blocks = (
      await Promise.all(
        range(cursorPosition, currentBlockHeight + 1).map((blockNumber) =>
          this.getBlockByNumber(blockNumber),
        ),
      )
    ).filter(Boolean);

    const newCursorPosition = cursorPosition + blocks.length;
    this.cursors.set(id, newCursorPosition);

    return full
      ? blocks.map((block) => {
          block = { ...block };
          delete block.size;
          delete block.totalDifficulty;
          delete block.transactions;
          delete block.uncles;

          return block;
        })
      : blocks.map(({ hash }: any) => ensureHexString(hash));
  }

  private async getPendingTransactionFilterChanges(): Promise<unknown> {
    // pending transaction filters are not supported
    return Promise.resolve([]);
  }

  private async setInitialCursorPosition(
    id: number,
    startBlock: BlockHeight,
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
      clearTimeout(existing);
    }
    const timeout = setTimeout(() => this.deleteFilter(id), TIMEOUT);
    this.timeouts.set(id, timeout);
  }

  private async getCurrentBlockHeight(): Promise<number> {
    const result = await this.requestProvider({
      method: "eth_blockNumber",
      params: [],
    });

    return intNumberFromHexString(ensureHexString(result));
  }

  private async getBlockByNumber(
    blockNumber: number,
  ): Promise<Record<string, any> | null> {
    const result = await this.requestProvider<any>({
      method: "eth_getBlockByNumber",
      params: [hexStringFromIntNumber(blockNumber), false],
    });

    return typeof result?.hash === "string" ? result : null;
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
    return 0;
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

function filterNotFoundError(): Error {
  const err = new Error("Filter not found");
  Object.assign(err, { code: -32000 });
  return err;
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
