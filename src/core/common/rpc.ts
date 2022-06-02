import { JsonRpcMethod } from "core/types/rpc";

export const JSONRPC = "2.0";
export const VIGVAM_STATE = "vigvam_state";
export const ETH_SUBSCRIPTION = "eth_subscription";

export const AUTHORIZED_RPC_METHODS = new Set<string>([
  JsonRpcMethod.eth_sendTransaction,
  JsonRpcMethod.eth_sign,
  JsonRpcMethod.personal_sign,
  JsonRpcMethod.eth_signTransaction,
  JsonRpcMethod.eth_signTypedData,
  JsonRpcMethod.eth_signTypedData_v1,
  JsonRpcMethod.eth_signTypedData_v2,
  JsonRpcMethod.eth_signTypedData_v3,
  JsonRpcMethod.eth_signTypedData_v4,
]);
