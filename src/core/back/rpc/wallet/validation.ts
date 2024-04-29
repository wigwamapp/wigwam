import {
  Describe,
  define,
  object,
  optional,
  array,
  number,
  string,
  nullable,
  nonempty,
  type,
  assert as assertSchema,
} from "superstruct";
import { ethers } from "ethers";
import { ethErrors } from "eth-rpc-errors";
import { openOrFocusMainTab } from "lib/ext/utils";

import {
  ActivitySource,
  AddEthereumChainParameter,
  TxParams,
  WalletStatus,
} from "core/types";
import { getNetwork } from "core/common";

import { $walletStatus, $accountAddresses } from "core/back/state";

export function validatePermission(source: ActivitySource) {
  if (source.type === "page" && !source.permission) {
    throw ethErrors.provider.unauthorized();
  }
}

export function assertWalletSetuped(opts?: { openIfNotSetuped: true }) {
  const status = $walletStatus.getState();
  if (status === WalletStatus.Welcome) {
    if (opts?.openIfNotSetuped) {
      openOrFocusMainTab();
    }

    throw ethErrors.provider.userRejectedRequest();
  }
}

export function validateAccount(
  source: ActivitySource,
  accountAddress: string,
) {
  if (!(accountAddress && ethers.isAddress(accountAddress))) {
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

export async function validateAddNetworkParams(params: unknown) {
  try {
    assertSchema(params, AddChainParamsSchema);
  } catch (err) {
    console.warn(err);
    throw ethErrors.rpc.invalidParams("Network params invalid");
  }
}

const stringHex = (length?: number) =>
  define<string>("stringHex", (value) => ethers.isHexString(value, length));

const stringOrNumber = () =>
  define<string | number>(
    "stringOrNumber",
    (value) => typeof value === "string" || typeof value === "number",
  );

const address = () =>
  define<string>("address", (value: any) => ethers.isAddress(value));

export const TxParamsSchema: Describe<TxParams> = object({
  from: address(),
  to: optional(address()),
  nonce: optional(stringOrNumber()),
  gasPrice: optional(stringHex()),
  gasLimit: optional(stringHex()),
  value: optional(stringHex()),
  data: optional(stringHex()),
  chainId: optional(stringOrNumber()),

  type: optional(stringOrNumber()),
  accessList: optional(
    array(
      object({
        address: address(),
        storageKeys: array(stringHex()),
      }),
    ),
  ),

  maxPriorityFeePerGas: optional(stringHex()),
  maxFeePerGas: optional(stringHex()),
});

export const AddChainParamsSchema: Describe<AddEthereumChainParameter> = type({
  chainId: stringHex(),
  chainName: string(),
  nativeCurrency: type({
    name: string(),
    symbol: string(),
    decimals: number(),
  }),
  rpcUrls: nonempty(array(string())),
  blockExplorerUrls: optional(nullable(array(string()))),
  iconUrls: optional(nullable(array(string()))),
});
