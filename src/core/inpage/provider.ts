import { ethErrors } from "eth-rpc-errors";
import { nanoid } from "nanoid";
import { Emitter } from "lib/emitter";

import { MetaMaskCompatibleMode } from "core/types/shared";
import {
  JsonRpcResponse,
  JsonRpcRequest,
  JsonRpcNotification,
  JsonRpcCallback,
  JsonRpcCallbackBatch,
  JsonRpcError,
  JsonRpcMethod,
  RequestArguments,
  SendSyncJsonRpcRequest,
} from "core/types/rpc";
import {
  JSONRPC,
  WIGWAM_STATE,
  AUTHORIZED_RPC_METHODS,
  STATE_RPC_METHODS,
} from "core/common/rpc";

import { InpageProtocol } from "./protocol";
import { FilterManager } from "./filterManager";
import { SubscriptionManager } from "./subscriptionManager";
import ICON_SVG_BASE64 from "./iconSvgBase64";

const gatewayEventType = Symbol();
const stateUpdatedType = Symbol();

type GatewayPayload<T = any> = JsonRpcResponse<T> | JsonRpcNotification<T>;

export class InpageProvider extends Emitter {
  isWigwam = true;
  isMetaMask = true;
  autoRefreshOnNetworkChange = false;

  mmCompatible = MetaMaskCompatibleMode.Strict;

  /**
   * The chain ID of the currently connected Ethereum chain.
   * See [chainId.network]{@link https://chainid.network} for more information.
   */
  chainId: string | null = null;
  networkVersion: string | null = null;

  /**
   * The user's currently selected Ethereum address.
   * If null, wallet is either locked or the user has not permitted any
   * addresses to be viewed.
   */
  selectedAddress: string | null = null;

  // https://eips.ethereum.org/EIPS/eip-6963
  // https://eips.ethereum.org/EIPS/eip-5749
  info: EIP6963ProviderInfo = Object.freeze({
    name: "Wigwam",
    uuid: `wigwam-${process.env.BUILD_ID}`,
    rdns: "com.wigwam.wallet",
    icon: ICON_SVG_BASE64,
    description: "Wigwam — Web 3.0 Wallet",
  });

  #inited = false;
  #reqIdPrefix = nanoid();
  #nextReqId = 0;

  #inpage: InpageProtocol;
  #filter = new FilterManager(this);
  #subscription = new SubscriptionManager(this, this.#filter);

  constructor(inpageProto: InpageProtocol) {
    super();

    this.#inpage = inpageProto;
    this.#listenInpage();
    this.#listenNotifications();

    this.request = this.request.bind(this);
    this.send = this.send.bind(this);
    this.sendAsync = this.sendAsync.bind(this);
    this.sendSync = this.sendSync.bind(this);
  }

  #getReqId() {
    return `${this.#reqIdPrefix}_${this.#nextReqId++}`;
  }

  #listenInpage() {
    this.#inpage.subscribe((payload) => {
      if (payload?.jsonrpc === JSONRPC) {
        this.emit(gatewayEventType, payload);
      }
    });
  }

  #listenNotifications() {
    this.on(gatewayEventType, (evt?: JsonRpcNotification<unknown>) => {
      if (evt?.method === WIGWAM_STATE) {
        const { chainId, accountAddress, mmCompatible } = evt.params as any;

        this.mmCompatible = mmCompatible;

        this.#handleStateChange(chainId, accountAddress || null);
        this.emit(stateUpdatedType, undefined);
      }
    });

    this.#subscription.on("message", (event) => {
      this.emit("message", event);
    });
  }

  #handleStateChange(chainId: number, address: string | null) {
    const chainIdHex = toHex(chainId);

    let connectEmitted = false;

    if (this.chainId !== chainIdHex) {
      if (this.chainId === null) {
        this.#inited = true;
        this.emit("connect", { chainId: chainIdHex });
        connectEmitted = true;
      }

      // Chain id: "0x1"
      this.chainId = chainIdHex;
      this.emit("chainChanged", chainIdHex);
      // Network version: "1"
      const chainIdStr = chainId.toString();
      this.networkVersion = chainIdStr;
      this.emit("networkChanged", chainIdStr);
    }

    if (this.selectedAddress !== address) {
      if (!connectEmitted && !this.selectedAddress && address && this.chainId) {
        this.emit("connect", { chainId: this.chainId });
      }

      this.selectedAddress = address;
      this.emit("accountsChanged", address ? [address] : []);
    }
  }

  async #performRequest(args: RequestArguments): Promise<unknown> {
    const pipes = [
      () => this.#requestSimpleMethods(args),
      () => this.#requestSubscriptionMethods(args),
      () => this.#requestFilterMethods(args),
      () => this.#restrictAuthorizedMethods(args),
      () => this.#requestGateway(args),
    ];

    for (const factory of pipes) {
      const result = await factory();
      if (result !== undefined) return result;
    }

    throw ethErrors.provider.unsupportedMethod();
  }

  async #requestSimpleMethods({
    method,
    params = [],
  }: RequestArguments): Promise<unknown> {
    switch (method) {
      case JsonRpcMethod.web3_clientVersion:
        return `Wigwam/v${process.env.VERSION}`;

      case JsonRpcMethod.eth_chainId:
        return this.chainId!;

      case JsonRpcMethod.net_version:
        return this.networkVersion!;

      case JsonRpcMethod.eth_coinbase:
        return this.selectedAddress;

      case JsonRpcMethod.eth_accounts:
        return this.selectedAddress ? [this.selectedAddress] : [];

      case JsonRpcMethod.eth_uninstallFilter:
        const filterId = (params as [string])[0];
        return this.#filter.uninstallFilter(filterId);

      case JsonRpcMethod.eth_requestAccounts:
        if (this.selectedAddress) return [this.selectedAddress];
        return;

      case JsonRpcMethod.wallet_getPermissions:
        if (!this.selectedAddress) return [];
        return;

      default:
        return;
    }
  }

  async #requestSubscriptionMethods({
    method,
    params,
  }: RequestArguments): Promise<unknown> {
    if (!Array.isArray(params)) return;

    switch (method) {
      case JsonRpcMethod.eth_subscribe:
        return this.#subscription.subscribe(params);

      case JsonRpcMethod.eth_unsubscribe:
        return this.#subscription.unsubscribe(params);

      default:
        return;
    }
  }

  async #requestFilterMethods({
    method,
    params = [],
  }: RequestArguments): Promise<unknown> {
    const param = (params as any[])[0];

    switch (method) {
      case JsonRpcMethod.eth_newFilter:
        return this.#filter.newFilter(param);

      case JsonRpcMethod.eth_newBlockFilter:
        return this.#filter.newBlockFilter();

      case JsonRpcMethod.eth_newPendingTransactionFilter:
        return this.#filter.newPendingTransactionFilter();

      case JsonRpcMethod.eth_getFilterChanges:
        return this.#filter.getFilterChanges(param);

      case JsonRpcMethod.eth_getFilterLogs:
        return this.#filter.getFilterLogs(param);

      default:
        return;
    }
  }

  async #restrictAuthorizedMethods({
    method,
  }: RequestArguments): Promise<undefined> {
    if (!this.selectedAddress && AUTHORIZED_RPC_METHODS.has(method)) {
      throw ethErrors.provider.unauthorized();
    }

    return;
  }

  #requestGateway<T = unknown>({ method, params }: RequestArguments) {
    return new Promise<T>((resolve, reject) => {
      const reqId = this.#getReqId();

      const handleRpcEvent = async (evt?: GatewayPayload<T>) => {
        if (evt && "id" in evt && evt.id === reqId) {
          this.removeListener(gatewayEventType, handleRpcEvent);

          if ("result" in evt) {
            if (STATE_RPC_METHODS.has(method)) {
              // Await until state updated
              await new Promise<void>((res) => {
                const complete = () => {
                  res();
                  this.removeListener(stateUpdatedType, complete);
                  clearTimeout(t);
                };

                this.on(stateUpdatedType, complete);
                const t = setTimeout(complete, 150);
              });
            }

            resolve(evt.result);
          } else {
            reject(evt.error);
          }
        }
      };

      this.on(gatewayEventType, handleRpcEvent);

      this.#inpage.send({
        jsonrpc: JSONRPC,
        id: reqId,
        method,
        params,
      });
    });
  }

  //====================
  // Public Methods
  //====================

  isConnected(): boolean {
    return this.#inited;
  }

  _metamask = {
    isUnlocked: async () => true,
  };

  /**
   * Submits an RPC request for the given method, with the given params.
   * Resolves with the result of the method call, or rejects on error.
   *
   * @param args - The RPC request arguments.
   * @param args.method - The RPC method name.
   * @param args.params - The parameters for the RPC method.
   * @returns A Promise that resolves with the result of the RPC method,
   * or rejects if an error is encountered.
   */
  async request(args: RequestArguments): Promise<unknown> {
    console.info("-> req", args);

    if (!this.#inited) {
      throw ethErrors.provider.disconnected();
    }

    if (!args || typeof args !== "object" || Array.isArray(args)) {
      throw ethErrors.rpc.invalidRequest({
        message: errorMessages.invalidRequestArgs(),
        data: args,
      });
    }

    const { method, params } = args;

    if (typeof method !== "string" || method.length === 0) {
      throw ethErrors.rpc.invalidRequest({
        message: errorMessages.invalidRequestMethod(),
        data: args,
      });
    }

    if (
      params !== undefined &&
      !Array.isArray(params) &&
      (typeof params !== "object" || params === null)
    ) {
      throw ethErrors.rpc.invalidRequest({
        message: errorMessages.invalidRequestParams(),
        data: args,
      });
    }

    if (!params) {
      args = { method, params: [] };
    }

    try {
      const result = await this.#performRequest(args);
      console.info("<- res", result);

      return result;
    } catch (err: any) {
      const {
        message = "Unknown error occurred",
        code = -32603,
        data,
      } = typeof err === "object" && err !== null ? err : ({} as any);

      const error = {
        message,
        code,
        data,
        stack: new Error(message).stack,
      };
      console.info("<- error", error);

      throw error;
    }
  }

  sendAsync<T>(
    payload: JsonRpcRequest<unknown>,
    callback: JsonRpcCallback<T>,
  ): void;
  sendAsync(
    payload: JsonRpcRequest<unknown>[],
    callback: JsonRpcCallback<unknown>[],
  ): void;
  sendAsync(payload: any, callback: any): void {
    this.send(payload, callback);
  }

  //====================
  // Deprecated Methods
  //====================

  /**
   * Equivalent to: ethereum.request('eth_requestAccounts')
   *
   * @deprecated Use request({ method: 'eth_requestAccounts' }) instead.
   * @returns A promise that resolves to an array of addresses.
   */
  enable() {
    return this.request({ method: JsonRpcMethod.eth_requestAccounts });
  }

  send<T>(method: string, params?: T[]): Promise<JsonRpcResponse<T>>;
  send<T>(payload: JsonRpcRequest<unknown>, callback: JsonRpcCallback<T>): void;
  send(
    payload: JsonRpcRequest<unknown>[],
    callback: JsonRpcCallbackBatch,
  ): void;
  send<T>(payload: SendSyncJsonRpcRequest): JsonRpcResponse<T>;
  send(methodOrPayload: unknown, callbackOrArgs?: unknown): unknown {
    if (
      typeof methodOrPayload === "string" &&
      (!callbackOrArgs || Array.isArray(callbackOrArgs))
    ) {
      return this.request({
        method: methodOrPayload,
        params: callbackOrArgs as any,
      }).then((result) => wrapRpcResponse({ result }));
    } else if (
      methodOrPayload &&
      typeof methodOrPayload === "object" &&
      typeof callbackOrArgs === "function"
    ) {
      if (Array.isArray(methodOrPayload)) {
        Promise.all(
          methodOrPayload.map((payload: JsonRpcRequest<any>) =>
            this.request(payload)
              .then((result) => wrapRpcResponse({ result }, payload))
              .catch((error) => wrapRpcResponse({ error }, payload)),
          ),
        ).then((result) => callbackOrArgs(null, result));

        return;
      }

      const payload = methodOrPayload as JsonRpcRequest<any>;

      this.request(payload)
        .then((result) =>
          callbackOrArgs(null, wrapRpcResponse({ result }, payload)),
        )
        .catch((error) =>
          callbackOrArgs(error, wrapRpcResponse({ error }, payload)),
        );

      return;
    }

    return this.sendSync(methodOrPayload as SendSyncJsonRpcRequest);
  }

  /**
   * Internal backwards compatibility method, used in send.
   *
   * @deprecated
   */
  sendSync(payload: SendSyncJsonRpcRequest) {
    let result;
    switch (payload.method) {
      case JsonRpcMethod.net_version:
        result = this.networkVersion || null;
        break;

      case JsonRpcMethod.eth_accounts:
        result = this.selectedAddress ? [this.selectedAddress] : [];
        break;

      case JsonRpcMethod.eth_coinbase:
        result = this.selectedAddress || null;
        break;

      case JsonRpcMethod.eth_uninstallFilter:
        this.request(payload as any).catch(console.error);
        result = true;
        break;

      default:
        throw new Error(errorMessages.unsupportedSync(payload.method));
    }

    return wrapRpcResponse({ result }, payload);
  }
}

function wrapRpcResponse<T>(
  res: { result: T } | { error: JsonRpcError },
  req?: JsonRpcRequest<unknown>,
): JsonRpcResponse<T> {
  return {
    id: req?.id ?? null,
    jsonrpc: req?.jsonrpc ?? JSONRPC,
    ...res,
  };
}

function toHex(val: number) {
  return `0x${val.toString(16)}`;
}

const errorMessages = {
  invalidRequestArgs: () => "Expected a single, non-array, object argument.",
  invalidRequestMethod: () => `'args.method' must be a non-empty string.`,
  invalidRequestParams: () =>
    `'args.params' must be an object or array if provided.`,
  unsupportedSync: (method: string) =>
    `The provider does not support synchronous methods like ${method} without a callback parameter.`,
};

interface EIP6963ProviderInfo {
  uuid: string;
  name: string;
  icon: string;
  rdns: string;
  description?: string;
}
