import { Describe, define, object, optional, array } from "superstruct";
import { ethers } from "ethers";
import { ethErrors } from "eth-rpc-errors";

import { ActivitySource, TxParams } from "core/types";
import { getNetwork } from "core/common";

import { $accountAddresses } from "core/back/state";

export function validatePermission(source: ActivitySource) {
  if (source.type === "page" && !source.permission) {
    throw ethErrors.provider.unauthorized();
  }
}

export function validateAccount(
  source: ActivitySource,
  accountAddress: string
) {
  if (!(accountAddress && ethers.utils.isAddress(accountAddress))) {
    throw ethErrors.rpc.invalidParams();
  }

  if (
    source.type === "page" &&
    !source.permission?.accountAddresses.includes(accountAddress)
  ) {
    throw ethErrors.provider.unauthorized();
  }

  if (!$accountAddresses.getState().includes(accountAddress)) {
    throw ethErrors.rpc.resourceUnavailable();
  }
}

export const validateNetwork = (chainId: number) =>
  getNetwork(chainId)
    .then(() => true)
    .catch(() => {
      throw ethErrors.rpc.resourceNotFound("Network not found");
    });

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
