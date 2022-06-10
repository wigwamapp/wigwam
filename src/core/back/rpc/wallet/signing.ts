import { ethErrors } from "eth-rpc-errors";

import { SigningStandard, RpcReply, ActivitySource } from "core/types";

export async function requestSigning(
  /* eslint-disable */
  source: ActivitySource,
  standard: SigningStandard,
  params: any[],
  rpcReply: RpcReply
) {
  throw ethErrors.provider.unsupportedMethod();
}
