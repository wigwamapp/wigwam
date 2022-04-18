import { match } from "ts-pattern";
import { assert } from "lib/system/assert";

import { ActivityType, ApprovalResult, TxParams } from "core/types";

import { Vault } from "../vault";
import { $accounts, $approvals, approvalResolved } from "../state";
import { sendRpc } from "../rpc";
import { ethers } from "ethers";
import { dequal } from "dequal/lite";

const { serializeTransaction, parseTransaction, keccak256, hexlify } =
  ethers.utils;

export async function processApprove(
  approvalId: string,
  { approved, rawTx, signedRawTx }: ApprovalResult,
  vault: Vault
) {
  const approval = $approvals.getState().find((a) => a.id === approvalId);
  assert(approval, "Not Found");

  if (approved) {
    await match(approval)
      .with(
        { type: ActivityType.Transaction },
        async ({ chainId, accountAddress, txParams, rpcReply }) => {
          assert(rawTx || signedRawTx, "Transaction not provided");

          const tx = parseTransaction(rawTx ?? signedRawTx!);
          validateTxOrigin(tx, txParams);

          if (!signedRawTx) {
            accountAddress = ethers.utils.getAddress(accountAddress);

            const account = $accounts
              .getState()
              .find((a) => a.address === accountAddress);
            assert(account, "Account not found");

            const signature = await vault.sign(account.uuid, keccak256(rawTx!));
            signedRawTx = serializeTransaction(tx, signature);
          }

          const rpcRes = await sendRpc(chainId, "eth_sendRawTransaction", [
            signedRawTx,
          ]);

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

const STRICT_TX_PROPS = [
  "to",
  "data",
  "accessList",
  "type",
  "chainId",
  "accessList",
  "value",
] as const;

function validateTxOrigin(tx: ethers.Transaction, originTxParams: TxParams) {
  for (const key of STRICT_TX_PROPS) {
    const txValue = hexlifyMaybe(tx[key]);
    const originValue = hexlifyMaybe(originTxParams[key]);

    console.info({ txValue, originValue });

    if (originValue) {
      assert(dequal(txValue, originValue), "Invalid transaction");
    }
  }
}

function hexlifyMaybe<T>(smth: T) {
  return ethers.BigNumber.isBigNumber(smth) ||
    ["string", "number"].includes(typeof smth)
    ? hexlify(smth as any)
    : smth;
}
