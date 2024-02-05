import { MessageContext } from "lib/ext/porter/server";
import { PorterClientMessage } from "lib/ext/porter/types";

import { SendRpcRequest, SendRpcResponse } from "./messages";

export enum JsonRpcMethod {
  // Simple
  eth_chainId = "eth_chainId",
  net_version = "net_version",
  eth_accounts = "eth_accounts",
  eth_coinbase = "eth_coinbase",
  eth_uninstallFilter = "eth_uninstallFilter",
  // Core
  eth_requestAccounts = "eth_requestAccounts",
  eth_sign = "eth_sign",
  eth_ecRecover = "eth_ecRecover",
  personal_sign = "personal_sign",
  personal_ecRecover = "personal_ecRecover",
  eth_signTransaction = "eth_signTransaction",
  eth_sendRawTransaction = "eth_sendRawTransaction",
  eth_sendTransaction = "eth_sendTransaction",
  eth_signTypedData = "eth_signTypedData",
  eth_signTypedData_v1 = "eth_signTypedData_v1",
  eth_signTypedData_v2 = "eth_signTypedData_v2",
  eth_signTypedData_v3 = "eth_signTypedData_v3",
  eth_signTypedData_v4 = "eth_signTypedData_v4",
  // Subscribtion
  eth_subscribe = "eth_subscribe",
  eth_unsubscribe = "eth_unsubscribe",
  // Filter
  eth_newFilter = "eth_newFilter",
  eth_newBlockFilter = "eth_newBlockFilter",
  eth_newPendingTransactionFilter = "eth_newPendingTransactionFilter",
  eth_getFilterChanges = "eth_getFilterChanges",
  eth_getFilterLogs = "eth_getFilterLogs",
  // Wallet
  wallet_getPermissions = "wallet_getPermissions",
  wallet_requestPermissions = "wallet_requestPermissions",
  wallet_addEthereumChain = "wallet_addEthereumChain",
  wallet_switchEthereumChain = "wallet_switchEthereumChain",
  wallet_watchAsset = "wallet_watchAsset",
  wallet_registerOnboarding = "wallet_registerOnboarding",
  web3_clientVersion = "web3_clientVersion",
  // Snaps
  wallet_getSnaps = "wallet_getSnaps",
  wallet_requestSnaps = "wallet_requestSnaps",
}

/**
 * A String specifying the version of the JSON-RPC protocol.
 * MUST be exactly "2.0".
 */
export type JsonRpcVersion = "2.0";

/**
 * An identifier established by the Client that MUST contain a String, Number,
 * or NULL value if included. If it is not included it is assumed to be a
 * notification. The value SHOULD normally not be Null and Numbers SHOULD
 * NOT contain fractional parts.
 */
export type JsonRpcId = number | string | null;

export interface JsonRpcError {
  message: string;
  code?: number;
  data?: unknown;
  stack?: string;
}

export interface JsonRpcRequest<T = unknown> {
  jsonrpc: JsonRpcVersion;
  method: string;
  id: JsonRpcId;
  params?: T;
}

export interface JsonRpcNotification<T> {
  jsonrpc: JsonRpcVersion;
  method: string;
  params?: T;
}

export type JsonRpcCallback<T> = (
  error: Error | null,
  result?: JsonRpcResponse<T>,
) => void;

export type JsonRpcCallbackBatch = (
  error: Error | null,
  result?: JsonRpcResponse<unknown>[],
) => void;

interface JsonRpcResponseBase {
  jsonrpc: JsonRpcVersion;
  id: JsonRpcId;
}

export interface JsonRpcSuccess<T> extends JsonRpcResponseBase {
  result: T;
}

export interface JsonRpcFailure extends JsonRpcResponseBase {
  error: JsonRpcError;
}

export type JsonRpcResponse<T = unknown> = JsonRpcSuccess<T> | JsonRpcFailure;

export interface RequestArguments {
  readonly method: string;
  readonly params?: readonly unknown[] | Record<string, unknown>;
}

export interface ProviderMessage {
  readonly type: string;
  readonly data: unknown;
}

export interface EthSubscription extends ProviderMessage {
  readonly type: "eth_subscription";
  readonly data: {
    readonly subscription: string;
    readonly result: unknown;
  };
}

export interface SendSyncJsonRpcRequest extends JsonRpcRequest<unknown> {
  method:
    | "net_version"
    | "eth_accounts"
    | "eth_coinbase"
    | "eth_uninstallFilter";
}

/**
 * Internal
 */

export type RpcResponse = { result: any } | { error: JsonRpcError };

export type SerializedRpcContext = {
  portId: string;
  msg: PorterClientMessage;
};

export interface RpcContext {
  serialize(): SerializedRpcContext;
  reply(response: RpcResponse): void;
}

export type RpcMessageContext = WalletRpcMsgContext | PageRpcMsgContext;

export type WalletRpcMsgContext = MessageContext<
  SendRpcRequest,
  SendRpcResponse
>;
export type PageRpcMsgContext = MessageContext<JsonRpcRequest, JsonRpcResponse>;
