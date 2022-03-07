import { match } from "ts-pattern";
import { assert } from "lib/system/assert";

import { ActivityType } from "core/types";

import { Vault } from "../vault";
import { $accounts, $approvals, approvalResolved } from "../state";
import { getRpcProvider, sendRpc } from "../rpc";
import { ethers } from "ethers";

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
          accountAddress = ethers.utils.getAddress(accountAddress);

          // console.info("txParams", txParams);
          // console.info("accountAddress", accountAddress);

          if ("gas" in txParams) {
            const { gas, ...rest } = txParams;
            txParams = { ...rest, gasLimit: gas };
          }

          const account = $accounts
            .getState()
            .find((a) => a.address === accountAddress);
          assert(account, "Account not found");

          const provider = getRpcProvider(chainId).getSigner(account.address);

          const tx: any = await provider.populateTransaction(txParams);
          // console.info({ tx });

          const rawTx = serializeTransaction(tx);
          const signature = vault.sign(account.uuid, keccak256(rawTx));

          const signedRawTx = serializeTransaction(tx, signature);

          const rpcRes = await sendRpc(chainId, "eth_sendRawTransaction", [
            signedRawTx,
          ]);

          // console.info({ rpcRes });

          if ("result" in rpcRes) {
            const txHash = rpcRes.result;

            rpcReply({ result: txHash });
          } else {
            console.info(rpcRes.error);
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
