import BigNumber from "bignumber.js";
import { storage } from "lib/ext/storage";
import { createQueue } from "lib/system/queue";

const enqueue = createQueue();

export function updateTotalBalance(
  accountAddress: string,
  update: BigNumber.Value | ((current: BigNumber) => BigNumber.Value),
) {
  return enqueue(async () => {
    const storageKey = createTotalBalanceKey(accountAddress);

    let value: BigNumber.Value;

    if (typeof update === "function") {
      const currentBalance = await storage.fetchForce<string>(storageKey);
      if (!currentBalance) return;

      value = update(new BigNumber(currentBalance));
    } else {
      value = update;
    }

    if (new BigNumber(value).isLessThan(0)) return;

    await storage.put(storageKey, new BigNumber(value).toString());
  });
}

export function createTotalBalanceKey(accountAddress: string) {
  return `total_balance_${accountAddress}`;
}
