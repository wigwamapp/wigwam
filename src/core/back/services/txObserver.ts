import retry from "async-retry";
import { ethers } from "ethers";
import { schedule } from "lib/system/schedule";

import { Activity, ActivityType } from "core/types";
import * as repo from "core/repo";

import { sendRpc } from "../rpc";

export async function startTxObserver() {
  schedule(5_000, async () => {
    const pendingTxs = await repo.activities
      .where("[type+pending]")
      .equals([ActivityType.Transaction, 1])
      .toArray();

    if (pendingTxs.length === 0) return;

    const txsToUpdate: Activity[] = [];

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
            { retries: 3, maxRetryTime: 1_000 }
          );

          if (
            result.blockNumber &&
            ethers.BigNumber.from(result.blockNumber).gt(0)
          ) {
            // TODO: Determinate error

            txsToUpdate.push({
              ...tx,
              pending: 0,
              result,
            });
          }
        } catch (err) {
          console.error(err);
        }
      })
    );

    await repo.activities.bulkPut(txsToUpdate);
  });
}
