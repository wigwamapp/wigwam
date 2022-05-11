import { BigNumber, BigNumberish, UnsignedTransaction } from "ethers";
import { storage } from "lib/ext/storage";
import { assert } from "lib/system/assert";
import { createQueue } from "lib/system/queue";

const enqueueSaveNonce = createQueue();

export function getNextNonce(
  tx: UnsignedTransaction,
  localNonce?: string | null
) {
  assert(tx.nonce !== undefined, "Nonce not found in transaction");

  if (!localNonce) return tx.nonce;

  const local = BigNumber.from(localNonce);
  return local.gte(tx.nonce) ? local.add(1).toNumber() : tx.nonce;
}

export function saveNonce(
  chainId: number,
  accountAddress: string,
  nonce: BigNumberish
) {
  return enqueueSaveNonce(async () => {
    try {
      const key = nonceStorageKey(chainId, accountAddress);
      const current = await storage.fetchForce<string>(key);

      if (current && BigNumber.from(current).lt(nonce)) {
        await storage.put(key, nonce.toString());
      }
    } catch (err) {
      console.error(err);
    }
  });
}

export function nonceStorageKey(chainId: number, accountAddress: string) {
  return `nonce_${chainId}_${accountAddress}`;
}
