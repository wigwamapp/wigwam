import { ethers } from "ethers";
import { storage } from "lib/ext/storage";
import { assert } from "lib/system/assert";
import { createQueue } from "lib/system/queue";

const enqueueSaveNonce = createQueue();

export function getNextNonce(
  tx: Pick<ethers.Transaction, "nonce">,
  localNonce?: string | null,
) {
  assert(tx.nonce !== undefined, "Nonce not found in transaction");

  if (!localNonce) return tx.nonce;

  const local = BigInt(localNonce);
  return local >= tx.nonce ? Number(local + 1n) : tx.nonce;
}

export function saveNonce(
  chainId: number,
  accountAddress: string,
  nonce: ethers.BigNumberish,
  override = false,
) {
  return enqueueSaveNonce(async () => {
    try {
      const key = nonceStorageKey(chainId, accountAddress);
      const current = await storage.fetchForce<string>(key);

      if (!current || override || BigInt(current) < BigInt(nonce)) {
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
