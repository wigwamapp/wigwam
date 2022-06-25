import retry from "async-retry";
import { ethers } from "ethers";
import { schedule } from "lib/system/schedule";

import { ActivityType, TransactionActivity } from "core/types";
import * as repo from "core/repo";

import { sendRpc } from "../rpc";
import { isUnlocked } from "../state";

export async function startTxObserver() {
  schedule(5_000, async () => {
    if (!isUnlocked()) return;

    const pendingTxs = (await repo.activities
      .where("[type+pending]")
      .equals([ActivityType.Transaction, 1])
      .toArray()) as TransactionActivity[];

    if (pendingTxs.length === 0) return;

    const txsToUpdate = new Map<string, TransactionActivity>();
    const completeHashes = new Set<string>();

    await Promise.all(
      pendingTxs.map(async (tx) => {
        if (tx.type !== ActivityType.Transaction) return;

        try {
          const result = await retry(
            async () => {
              const res = await sendRpc(
                tx.chainId,
                "eth_getTransactionByHash",
                [tx.txHash]
              );
              if ("error" in res) {
                throw new Error(res.error.message);
              }
              return res.result;
            },
            { retries: 3, maxTimeout: 1_000 }
          );

          const toUpdate = {
            ...tx,
            result: result || tx.result,
          };

          if (
            result &&
            result.blockNumber &&
            ethers.BigNumber.from(result.blockNumber).gt(0)
          ) {
            // TODO: Determinate error

            completeHashes.add(tx.txHash);

            const skippedHashes = findSkippedTxs(tx, pendingTxs);
            for (const hash of skippedHashes) {
              completeHashes.add(hash);
            }
          }

          txsToUpdate.set(tx.txHash, toUpdate);
        } catch (err) {
          console.error(err);
        }
      })
    );

    for (const hash of completeHashes) {
      const tx = txsToUpdate.get(hash);
      if (tx) tx.pending = 0;
    }

    await repo.activities.bulkPut(Array.from(txsToUpdate.values()));

    await Promise.all(
      Array.from(completeHashes).map((txHash) =>
        repo.tokenActivities
          .where({ txHash, pending: 1 })
          .modify((tokenActivity) => {
            tokenActivity.pending = 0;
          })
          .catch(() => undefined)
      )
    );
  });
}

function findSkippedTxs(
  origin: TransactionActivity,
  allPending: TransactionActivity[]
) {
  const skippedHashes: string[] = [];

  for (const tx of allPending) {
    if (
      tx.txHash !== origin.txHash &&
      tx.chainId === origin.chainId &&
      tx.accountAddress == origin.accountAddress
    ) {
      const { nonce: originNonce } = ethers.utils.parseTransaction(
        origin.rawTx
      );
      const { nonce: txNonce } = ethers.utils.parseTransaction(tx.rawTx);

      if (originNonce >= txNonce) {
        skippedHashes.push(tx.txHash);
      }
    }
  }

  return skippedHashes;
}
