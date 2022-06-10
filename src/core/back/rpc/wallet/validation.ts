import { Describe, define, object, optional, array } from "superstruct";
import { ethers } from "ethers";
import { ethErrors } from "eth-rpc-errors";
import memoize from "mem";

import { ActivitySource, TxParams } from "core/types";
import { getNetwork } from "core/common";

export function validatePermission(source: ActivitySource) {
  if (source.type === "page" && !source.permission) {
    throw ethErrors.provider.unauthorized();
  }
}

export const validateNetwork = memoize(getNetwork);

const stringHex = (length?: number) =>
  define<string>("stringHex", (value) =>
    ethers.utils.isHexString(value, length)
  );

const address = () =>
  define<string>("address", (value: any) => ethers.utils.isAddress(value));

export const TxParamsSchema: Describe<TxParams> = object({
  from: address(),
  to: optional(address()),
  nonce: optional(stringHex()),
  gasPrice: optional(stringHex()),
  gasLimit: optional(stringHex()),
  value: optional(stringHex()),
  data: optional(stringHex()),
  chainId: optional(stringHex()),

  type: optional(stringHex()),
  accessList: optional(
    array(
      object({
        address: address(),
        storageKeys: array(stringHex()),
      })
    )
  ),

  maxPriorityFeePerGas: optional(stringHex()),
  maxFeePerGas: optional(stringHex()),
});
