import retry from "async-retry";
import { AxiosResponse } from "axios";
import { schedule } from "lib/system/schedule";

import { ActivityType, OnRampTxStatus, RampActivity } from "core/types";
import * as repo from "core/repo";

import { isUnlocked } from "../state";
import { indexerApi } from "../sync";

type TransakTxResponse = Pick<
  RampActivity,
  "id" | "status" | "statusReason" | "transactionHash"
>;

type TransakTxUpdatingFields = TransakTxResponse &
  Pick<RampActivity, "pending" | "withError">;

export async function startRampTxObserver() {
  schedule(5_000, async () => {
    if (!isUnlocked()) return;

    const pendingTxs = (await repo.activities
      .where("[type+pending]")
      .equals([ActivityType.Ramp, 1])
      .toArray()) as RampActivity[];
    const txsToUpdate: TransakTxUpdatingFields[] = [];

    if (pendingTxs.length === 0) return;

    await Promise.all(
      pendingTxs.map(async (tx) => {
        if (tx.type !== ActivityType.Ramp) return;

        try {
          const { data: rampTx, status } = await retry(
            () =>
              indexerApi.get<
                { staging: boolean },
                AxiosResponse<TransakTxResponse>
              >(`/transak/order/${tx.partnerOrderId}/status`, {
                params: {
                  staging: process.env.RELEASE_ENV !== "true",
                },
              }),
            { retries: 3, maxTimeout: 1_000 },
          );

          if (rampTx && status === 200) {
            const updatedTx: TransakTxUpdatingFields = {
              id: tx.id,
              status: rampTx.status,
              statusReason: rampTx.statusReason,
              transactionHash: rampTx.transactionHash,
              pending: isPendingTx(rampTx.status) ? 1 : 0,
              withError: hasTxError(rampTx.status),
            };

            txsToUpdate.push(updatedTx);
          } else {
            console.error("[Transak failed response]", status, rampTx);
          }
        } catch (err) {
          console.error(err);
        }
      }),
    );

    if (txsToUpdate.length > 0) {
      await Promise.all(
        txsToUpdate.map(
          async (activity) =>
            await repo.activities.update(activity.id, activity),
        ),
      );
    }
  });
}

const isPendingTx = (status: OnRampTxStatus) => {
  if (
    ["COMPLETED", "CANCELLED", "FAILED", "REFUNDED", "EXPIRED"].includes(status)
  ) {
    return false;
  }

  return true;
};

const hasTxError = (status: OnRampTxStatus) => {
  if (["CANCELLED", "FAILED"].includes(status)) {
    return true;
  }

  return false;
};
