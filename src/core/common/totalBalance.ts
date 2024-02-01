import BigNumber from "bignumber.js";
import { storage } from "lib/ext/storage";

export async function updateTotalBalance(
  accountAddress: string,
  update: BigNumber.Value | ((current: BigNumber) => BigNumber.Value),
) {
  const storageKey = createTotalBalanceKey(accountAddress);

  let value: BigNumber.Value;

  if (typeof update === "function") {
    const currentBalance = await storage.fetchForce<string>(storageKey);
    if (!currentBalance) return;

    value = update(new BigNumber(currentBalance));
  } else {
    value = update;
  }

  await storage.put(storageKey, new BigNumber(value).toString());
}

export function createTotalBalanceKey(accountAddress: string) {
  return `total_balance_${accountAddress}`;
}
