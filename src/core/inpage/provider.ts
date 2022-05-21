import { ethErrors } from "eth-rpc-errors";
import { nanoid } from "nanoid";
import { Emitter } from "lib/emitter";

import { JsonRpcResponse, JsonRpcRequest, JsonRpcNotification } from "./types";
import { InpageProtocol } from "./protocol";

const JSONRPC = "2.0";
const VIGVAM_STATE = "vigvam_state";
const ETH_SUBSCRIPTION = "eth_subscription";

const GatewayMsg = Symbol();

type GatewayPayload<T = any> = JsonRpcResponse<T> | JsonRpcNotification<T>;
type ProviderEvent = EthSubscription | GatewayPayload<unknown>;
type InpageProviderOptions = Partial<{
  isMetaMask: boolean;
}>;

export class InpageProvider extends Emitter<ProviderEvent> {
  /**
   * Indicating that this provider is a MetaMask provider.
   */
  public readonly isMetaMask: boolean;
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

  constructor(opts: InpageProviderOptions = {}) {
    super();

    this.isMetaMask = opts.isMetaMask ?? false;

    this.listenInpage();
    this.listenNotifications();
  }

  private listenInpage() {
    this.inpage.subscribe((payload) => {
      if (payload?.jsonrpc === JSONRPC) {
        this.emit(GatewayMsg, payload);
      }
    });

    this.inpage.send("inited");
  }

  private listenNotifications() {
    this.on(GatewayMsg, (evt?: JsonRpcNotification<unknown>) => {
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

  private requestGateway<T = unknown>({ method, params }: RequestArguments) {
    return new Promise<T>((resolve, reject) => {
      const reqId = this.getReqId();

      const handleRpcEvent = (evt?: GatewayPayload<T>) => {
        if (evt && "id" in evt && evt.id === reqId) {
          this.removeListener(GatewayMsg, handleRpcEvent);

          if ("result" in evt) {
            resolve(evt.result);
          } else {
            const err = new Error(evt.error.message);
            Object.assign(err, evt.error);

            reject(err);
          }
        }
      };

      this.on(GatewayMsg, handleRpcEvent);

      this.inpage.send({
        jsonrpc: JSONRPC,
        id: reqId,
        method,
        params,
      });
    });
  }

  private getReqId() {
    return `${this.reqIdPrefix}_${this.nextReqId++}`;
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
  async request(args: RequestArguments): Promise<unknown> {
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

    switch (method) {
      case "eth_chainId":
        return this.chainId!;

      case "net_version":
        return this.networkVersion!;

      case "eth_coinbase":
        return this.selectedAddress;

      case "eth_accounts":
        return this.selectedAddress ? [this.selectedAddress] : [];

      case "eth_requestAccounts":
        if (this.selectedAddress) return [this.selectedAddress];
    }

    // "wallet_getPermissions":
    // "wallet_requestPermissions"
    return this.requestGateway(args);
  }

  /**
   * Submits an RPC request per the given JSON-RPC request object.
   *
   * @param payload - The RPC request object.
   * @param cb - The callback function.
   */
  sendAsync(
    payload: JsonRpcRequest<unknown>,
    callback: (error: Error | null, result?: JsonRpcResponse<unknown>) => void
  ): void {
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

  /**
   * Submits an RPC request for the given method, with the given params.
   *
   * @deprecated Use "request" instead.
   * @param method - The method to request.
   * @param params - Any params for the method.
   * @returns A Promise that resolves with the JSON-RPC response object for the
   * request.
   */
  send<T>(method: string, params?: T[]): Promise<JsonRpcResponse<T>>;

  /**
   * Submits an RPC request per the given JSON-RPC request object.
   *
   * @deprecated Use "request" instead.
   * @param payload - A JSON-RPC request object.
   * @param callback - An error-first callback that will receive the JSON-RPC
   * response object.
   */
  send<T>(
    payload: JsonRpcRequest<unknown>,
    callback: (error: Error | null, result?: JsonRpcResponse<T>) => void
  ): void;

  /**
   * Accepts a JSON-RPC request object, and synchronously returns the cached result
   * for the given method. Only supports 4 specific RPC methods.
   *
   * @deprecated Use "request" instead.
   * @param payload - A JSON-RPC request object.
   * @returns A JSON-RPC response object.
   */
  send<T>(payload: SendSyncJsonRpcRequest): JsonRpcResponse<T>;

  send(methodOrPayload: unknown, callbackOrArgs?: unknown): unknown {
    if (
      typeof methodOrPayload === "string" &&
      (!callbackOrArgs || Array.isArray(callbackOrArgs))
    ) {
      return this.request({
        method: methodOrPayload,
        params: callbackOrArgs as any,
      });
    } else if (
      methodOrPayload &&
      typeof methodOrPayload === "object" &&
      typeof callbackOrArgs === "function"
    ) {
      this.request(methodOrPayload as JsonRpcRequest<any>)
        .then((result) => callbackOrArgs(null, result))
        .catch((err) => callbackOrArgs(err));
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
      case "net_version":
        result = this.networkVersion || null;
        break;

      case "eth_accounts":
        result = this.selectedAddress ? [this.selectedAddress] : [];
        break;

      case "eth_coinbase":
        result = this.selectedAddress || null;
        break;

      case "eth_uninstallFilter":
        this.request(payload as any);
        result = true;
        break;

      default:
        throw new Error(errorMessages.unsupportedSync(payload.method));
    }

    return {
      id: payload.id,
      jsonrpc: payload.jsonrpc,
      result,
    };
  }
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

interface SendSyncJsonRpcRequest extends JsonRpcRequest<unknown> {
  method:
    | "net_version"
    | "eth_accounts"
    | "eth_coinbase"
    | "eth_uninstallFilter";
}

interface RequestArguments {
  readonly method: string;
  readonly params?: readonly unknown[] | Record<string, unknown>;
}

interface ProviderMessage {
  readonly type: string;
  readonly data: unknown;
}

interface EthSubscription extends ProviderMessage {
  readonly type: "eth_subscription";
  readonly data: {
    readonly subscription: string;
    readonly result: unknown;
  };
}

// interface ProviderConnectInfo {
//   readonly chainId: string;
// }

// class ProviderRpcError extends Error {
//   name = "ProviderRpcError";

//   constructor(public code: number, public data?: unknown) {
//     super(PROVIDER_ERRORS[code] ?? "Unknown error occurred");
//   }
// }

// const PROVIDER_ERRORS: Record<number, string> = {
//   4001: "The user rejected the request",
//   4100: "The requested method and/or account has not been authorized by the user",
//   4200: "The Provider does not support the requested method",
//   4900: "The Provider is disconnected from all chains",
//   4901: "The Provider is not connected to the requested chain",
// };
