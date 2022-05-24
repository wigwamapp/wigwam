import { ethErrors } from "eth-rpc-errors";
import { nanoid } from "nanoid";
import { Emitter } from "lib/emitter";

import {
  JsonRpcResponse,
  JsonRpcRequest,
  JsonRpcNotification,
  JsonRpcCallback,
  JsonRpcCallbackBatch,
  JsonRpcError,
  JsonRpcMethod,
  RequestArguments,
  EthSubscription,
} from "core/types/rpc";
import { InpageProtocol } from "./protocol";
import { FilterManager } from "./filterManager";
// import { SubscriptionManager } from "./subscriptionManager";

const JSONRPC = "2.0";
const VIGVAM_STATE = "vigvam_state";
const ETH_SUBSCRIPTION = "eth_subscription";

const gatewayEventType = Symbol();

type GatewayPayload<T = any> = JsonRpcResponse<T> | JsonRpcNotification<T>;
type ProviderEvent = EthSubscription | GatewayPayload<unknown>;

export class InpageProvider extends Emitter<ProviderEvent> {
  public readonly isMetaMask: boolean = false;
  public readonly isVigvam: boolean = true;
  public readonly autoRefreshOnNetworkChange = false;

  /**
   * The chain ID of the currently connected Ethereum chain.
   * See [chainId.network]{@link https://chainid.network} for more information.
   */
  public chainId: string | null = null;
  public networkVersion: string | null = null;

  /**
   * The user's currently selected Ethereum address.
   * If null, wallet is either locked or the user has not permitted any
   * addresses to be viewed.
   */
  public selectedAddress: string | null = null;

  private inited = false;
  private reqIdPrefix = nanoid();
  private nextReqId = 0;

  private inpage = new InpageProtocol("injected", "content");
  private filter = new FilterManager(this);
  // private subs = new SubscriptionManager(this, this.filter);

  constructor() {
    super();

    this.listenInpage();
    this.listenNotifications();
  }

  private getReqId() {
    return `${this.reqIdPrefix}_${this.nextReqId++}`;
  }

  private listenInpage() {
    this.inpage.subscribe((payload) => {
      if (payload?.jsonrpc === JSONRPC) {
        this.emit(gatewayEventType, payload);
      }
    });
  }

  private listenNotifications() {
    this.on(gatewayEventType, (evt?: JsonRpcNotification<unknown>) => {
      if (!evt?.method) return;

      switch (evt.method) {
        case VIGVAM_STATE:
          const { chainId, accountAddress } = evt.params as any;

          this.handleNetworkChange(chainId);
          this.handleAccountChange(accountAddress || null);
          return;

        case ETH_SUBSCRIPTION:
          this.emit("message", {
            type: ETH_SUBSCRIPTION,
            data: evt.params,
          });
          return;
      }
    });
  }

  private handleNetworkChange(chainId: number) {
    const chainIdHex = toHex(chainId);

    if (this.chainId === chainIdHex) return;

    if (this.chainId === null) {
      this.inited = true;
      this.emit("connect", { chainId: chainIdHex });
    }

    // Chain id: "0x1"
    this.chainId = chainIdHex;
    this.emit("chainChanged", chainIdHex);
    // Network version: "1"
    const chainIdStr = chainId.toString();
    this.networkVersion = chainIdStr;
    this.emit("networkChanged", chainIdStr);
  }

  private handleAccountChange(address: string | null) {
    if (this.selectedAddress === address) return;

    this.selectedAddress = address;
    this.emit("accountsChanged", address ? [address] : []);
  }

  private async performRequest(args: RequestArguments): Promise<unknown> {
    const pipes = [
      () => this.requestSimpleMethods(args),
      () => this.requestSubscriptionMethods(args),
      () => this.requestFilterMethods(args),
      () => this.restrictAuthorizedMethods(args),
      () => this.requestGateway(args),
    ];

    for (const factory of pipes) {
      const result = await factory();
      if (result) return result;
    }

    throw ethErrors.provider.unsupportedMethod();
  }

  private async requestSimpleMethods({
    method,
    params = [],
  }: RequestArguments): Promise<unknown> {
    switch (method) {
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
        return this.filter.uninstallFilter(filterId);

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

  private async requestSubscriptionMethods({
    method,
  }: RequestArguments): Promise<unknown> {
    switch (method) {
      case JsonRpcMethod.eth_subscribe:
      case JsonRpcMethod.eth_unsubscribe:
        throw ethErrors.provider.unsupportedMethod();

      default:
        return;
    }
  }

  private async requestFilterMethods({
    method,
    params = [],
  }: RequestArguments): Promise<unknown> {
    const param = (params as any[])[0];

    switch (method) {
      case JsonRpcMethod.eth_newFilter:
        return this.filter.newFilter(param);

      case JsonRpcMethod.eth_newBlockFilter:
        return this.filter.newBlockFilter();

      case JsonRpcMethod.eth_newPendingTransactionFilter:
        return this.filter.newPendingTransactionFilter();

      case JsonRpcMethod.eth_getFilterChanges:
        return this.filter.getFilterChanges(param);

      case JsonRpcMethod.eth_getFilterLogs:
        return this.filter.getFilterLogs(param);

      default:
        return;
    }
  }

  private async restrictAuthorizedMethods({
    method,
  }: RequestArguments): Promise<undefined> {
    if (!this.selectedAddress && AUTHORIZED_RPC_METHODS.has(method)) {
      throw ethErrors.provider.unauthorized();
    }

    return;
  }

  private requestGateway<T = unknown>({ method, params }: RequestArguments) {
    return new Promise<T>((resolve, reject) => {
      const reqId = this.getReqId();

      const handleRpcEvent = (evt?: GatewayPayload<T>) => {
        if (evt && "id" in evt && evt.id === reqId) {
          this.removeListener(gatewayEventType, handleRpcEvent);

          if ("result" in evt) {
            resolve(evt.result);
          } else {
            const {
              message = "Unknown error occurred",
              code,
              data,
            } = evt.error;
            const err = new Error(message);

            reject({ message, code, data, stack: err.stack });
          }
        }
      };

      this.on(gatewayEventType, handleRpcEvent);

      this.inpage.send({
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
    return this.inited;
  }

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
  request(args: RequestArguments): Promise<unknown> {
    if (!this.inited) {
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

    return this.performRequest(args);
  }

  sendAsync<T>(
    payload: JsonRpcRequest<unknown>,
    callback: JsonRpcCallback<T>
  ): void;
  sendAsync(
    payload: JsonRpcRequest<unknown>[],
    callback: JsonRpcCallback<unknown>[]
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
    return this.request({ method: "eth_requestAccounts" });
  }

  send<T>(method: string, params?: T[]): Promise<JsonRpcResponse<T>>;
  send<T>(payload: JsonRpcRequest<unknown>, callback: JsonRpcCallback<T>): void;
  send(
    payload: JsonRpcRequest<unknown>[],
    callback: JsonRpcCallbackBatch
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
              .catch((error) => wrapRpcResponse({ error }, payload))
          )
        ).then((result) => callbackOrArgs(null, result));

        return;
      }

      const payload = methodOrPayload as JsonRpcRequest<any>;

      this.request(payload)
        .then((result) =>
          callbackOrArgs(null, wrapRpcResponse({ result }, payload))
        )
        .catch((error) =>
          callbackOrArgs(error, wrapRpcResponse({ error }, payload))
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
  protected sendSync(payload: SendSyncJsonRpcRequest) {
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
  req?: JsonRpcRequest<unknown>
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

const AUTHORIZED_RPC_METHODS = new Set<string>([
  JsonRpcMethod.eth_sign,
  JsonRpcMethod.personal_sign,
  JsonRpcMethod.eth_signTransaction,
  JsonRpcMethod.eth_signTypedData,
  JsonRpcMethod.eth_signTypedData_v1,
  JsonRpcMethod.eth_signTypedData_v2,
  JsonRpcMethod.eth_signTypedData_v3,
  JsonRpcMethod.eth_signTypedData_v4,
]);

const errorMessages = {
  invalidRequestArgs: () => "Expected a single, non-array, object argument.",
  invalidRequestMethod: () => `'args.method' must be a non-empty string.`,
  invalidRequestParams: () =>
    `'args.params' must be an object or array if provided.`,
  unsupportedSync: (method: string) =>
    `The provider does not support synchronous methods like ${method} without a callback parameter.`,
};

interface SendSyncJsonRpcRequest extends JsonRpcRequest<unknown> {
  method:
    | "net_version"
    | "eth_accounts"
    | "eth_coinbase"
    | "eth_uninstallFilter";
}
