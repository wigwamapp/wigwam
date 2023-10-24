import { ethers } from "ethers";
import { dequal } from "dequal/lite";
import { assert } from "lib/system/assert";

import { TxParams, AccountSource } from "core/types";

import { $accounts } from "../state";

export function getAccountSafe(accountAddress: string) {
  accountAddress = ethers.getAddress(accountAddress);

  const account = $accounts
    .getState()
    .find((a) => a.address === accountAddress);

  assert(account, "Account not found");
  assert(
    account.source !== AccountSource.Address,
    "This wallet was added as a watch-only account by importing an address." +
      " It is not possible to perform signing using this type of accounts.",
  );

  return account;
}

export function parseTxSafe(rawTx: string): ethers.Transaction {
  const tx = ethers.Transaction.from(rawTx);
  // Remove signature props
  tx.signature = null;

  return tx;
}

export const STRICT_TX_PROPS = [
  "to",
  "data",
  "accessList",
  "chainId",
  "value",
] as const;

export function validateTxOrigin(
  tx: ethers.Transaction,
  originTxParams: TxParams,
) {
  for (const key of STRICT_TX_PROPS) {
    const txValue = hexValueMaybe(tx[key]);
    const originValue = hexValueMaybe(originTxParams[key]);

    if (originValue) {
      assert(dequal(txValue, originValue), "Invalid transaction");
    }
  }
}

export function hexValueMaybe<T>(smth: T) {
  if (smth === undefined) return;

  if (["string", "number", "bigint"].includes(typeof smth)) {
    return ethers.toQuantity(smth as any);
  }

  return smth;
}
