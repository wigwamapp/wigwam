import { JsonRpcMethod } from "core/types/rpc";

export const JSONRPC = "2.0";
export const WIGWAM_STATE = "wigwam_state";
export const WIGWAM_FAVICON = "wigwam_favicon";
export const WIGWAM_PHISHING_WARNING = "wigwam_phishing_warning";
export const ETH_SUBSCRIPTION = "eth_subscription";

export const AUTHORIZED_RPC_METHODS = new Set<string>([
  // Transaction
  JsonRpcMethod.eth_sendTransaction,
  JsonRpcMethod.eth_signTransaction,
  // Signing
  JsonRpcMethod.eth_sign,
  JsonRpcMethod.eth_ecRecover,
  JsonRpcMethod.personal_sign,
  JsonRpcMethod.personal_ecRecover,
  JsonRpcMethod.eth_signTypedData,
  JsonRpcMethod.eth_signTypedData_v1,
  JsonRpcMethod.eth_signTypedData_v2,
  JsonRpcMethod.eth_signTypedData_v3,
  JsonRpcMethod.eth_signTypedData_v4,
]);

export const STATE_RPC_METHODS = new Set<string>([
  JsonRpcMethod.eth_requestAccounts,
  JsonRpcMethod.wallet_requestPermissions,
  JsonRpcMethod.wallet_switchEthereumChain,
  JsonRpcMethod.wallet_addEthereumChain,
]);

export const DISCONNECT_ERROR = {
  code: 4900,
  message: "The provider is disconnected from all chains.",
};
