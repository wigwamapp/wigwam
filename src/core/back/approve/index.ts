import { match } from "ts-pattern";
import { assert } from "lib/system/assert";

import { ActivityType } from "core/types";

import { Vault } from "../vault";
import { $approvals, approvalResolved } from "../state";
import { sendRpc } from "../rpc";
import { ethers, UnsignedTransaction } from "ethers";

const { serializeTransaction, keccak256 } = ethers.utils;

export async function processApprove(
  approvalId: string,
  approve: boolean,
  vault: Vault
) {
  const approval = $approvals.getState().find((a) => a.id === approvalId);
  assert(approval, "Not Found");

  if (approve) {
    await match(approval)
      .with(
        { type: ActivityType.Transaction },
        async ({ chainId, accountAddress, txParams, rpcReply }) => {
          console.info({ txParams });

          const tx = txParams as UnsignedTransaction;

          const rawTx = serializeTransaction(tx);
          const signature = vault.sign(accountAddress, keccak256(rawTx));

          const signedRawTx = serializeTransaction(tx, signature);

          const rpcRes = await sendRpc(chainId, "eth_sendRawTransaction", [
            signedRawTx,
          ]);

          console.info({ rpcRes });

          if ("result" in rpcRes) {
            const [txHash] = rpcRes.result;

            rpcReply({ result: txHash });
          } else {
            const { message, ...data } = rpcRes.error;

            const err = new Error(message);
            Object.assign(err, { data });

            throw err;
          }
        }
      )
      .otherwise(() => {
        throw new Error("Not Found");
      });
  } else {
    approval.rpcReply({ error: { message: "Declined" } });
  }

  approvalResolved(approvalId);
}
