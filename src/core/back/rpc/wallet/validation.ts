import { Describe, define, object, optional } from "superstruct";
import { ethers } from "ethers";

import { TxParams } from "core/types";

const stringHex = (length?: number) =>
  define<string>("stringHex", (value) =>
    ethers.utils.isHexString(value, length)
  );

const address = () =>
  define<string>("address", (value: any) => ethers.utils.isAddress(value));

export const TxParamsSchema: Describe<TxParams> = object({
  from: address(),
  to: address(),
  nonce: optional(stringHex()),
  gasPrice: optional(stringHex()),
  gas: optional(stringHex()),
  gasLimit: optional(stringHex()),
  value: optional(stringHex()),
  data: optional(stringHex()),
  chainId: optional(stringHex()),
});
