import { nanoid } from "nanoid";
import { match } from "ts-pattern";
import { ethers } from "ethers";
import { ethErrors } from "eth-rpc-errors";
import { assert } from "lib/system/assert";

import { DEFAULT_NETWORKS, INITIAL_NETWORK } from "fixtures/networks";
import { ActivityType, ApprovalResult, Permission } from "core/types";
import * as repo from "core/repo";
import { saveNonce } from "core/common/nonce";
import { getPageOrigin, wrapPermission } from "core/common/permissions";
import { matchTxAction } from "core/common/transaction";

import { Vault } from "../vault";
import { $approvals, approvalResolved } from "../state";
import { sendRpc, getRpcProvider } from "../rpc";

import { saveActivity, saveTokenActivity } from "./saveActivity";
import { parseTxSafe, validateTxOrigin, getAccountSafe } from "./utils";

export async function processApprove(
  approvalId: string,
  {
    approved,
    rawTx,
    signature,
    signedMessage,
    accountAddresses,
    overriddenChainId,
  }: ApprovalResult,
  vault: Vault,
) {
  const approval = $approvals.getState().find((a) => a.id === approvalId);
  assert(approval, "Not Found");

  if (approved) {
    await match(approval)
      .with(
        { type: ActivityType.Connection },
        async ({
          rpcCtx,
          type,
          source,
          returnSelectedAccount,
          preferredChainId,
        }) => {
          assert(accountAddresses?.length, "Accounts not provided");

          const origin = getPageOrigin(source);

          const newPermission: Permission = {
            origin,
            id: nanoid(),
            timeAt: Date.now(),
            accountAddresses,
            chainId:
              overriddenChainId ?? preferredChainId ?? INITIAL_NETWORK.chainId,
          };

          await repo.permissions.put(newPermission);

          const toReturn = returnSelectedAccount
            ? accountAddresses[0]
            : wrapPermission(newPermission);

          await saveActivity({
            id: nanoid(),
            type,
            source,
            returnSelectedAccount,
            preferredChainId,
            accountAddresses,
            timeAt: Date.now(),
            pending: 0,
          });

          rpcCtx?.reply({ result: [toReturn] });
        },
      )
      .with(
        { type: ActivityType.Transaction },
        async ({ rpcCtx, type, source, chainId, accountAddress, txParams }) => {
          assert(rawTx, "Transaction not provided");

          const tx = parseTxSafe(rawTx);
          validateTxOrigin(tx, txParams);

          if (!signature) {
            accountAddress = ethers.getAddress(accountAddress);
            const account = getAccountSafe(accountAddress);

            signature = await vault.sign(
              account.uuid,
              ethers.keccak256(rawTx!),
            );
          }

          const signedTx = tx.clone();
          signedTx.signature = signature;

          if (
            process.env.NODE_ENV !== "production" &&
            process.env.WIGWAM_DEV_BLOCK_TX_SEND === "true"
          ) {
            throw new Error("Blocked by WIGWAM_DEV_BLOCK_TX_SEND env variable");
          }

          const rpcRes = await pushTransaction(chainId, signedTx);

          if ("result" in rpcRes) {
            const txHash = rpcRes.result;
            const timeAt = Date.now();

            const txAction = await matchTxAction(
              getRpcProvider(chainId),
              txParams,
            ).catch(() => null);

            await Promise.all([
              saveNonce(chainId, accountAddress, tx.nonce),
              saveActivity({
                id: nanoid(),
                type,
                source,
                chainId,
                accountAddress,
                txParams,
                rawTx: rawTx!,
                txAction: txAction ?? undefined,
                txHash,
                timeAt,
                pending: 1,
              }),
              saveTokenActivity(
                txAction,
                chainId,
                accountAddress,
                txHash,
                timeAt,
              ),
            ]);

            rpcCtx?.reply({ result: txHash });
          } else {
            console.warn(rpcRes.error);

            const { message, ...data } = rpcRes.error;
            const err = new Error(message);
            Object.assign(err, { data });

            throw err;
          }
        },
      )
      .with(
        { type: ActivityType.Signing },
        async ({ rpcCtx, type, source, standard, accountAddress, message }) => {
          if (signedMessage) {
            rpcCtx?.reply({ result: signedMessage });
            return;
          }

          accountAddress = ethers.getAddress(accountAddress);
          const account = getAccountSafe(accountAddress);

          const signature = vault.signMessage(account.uuid, standard, message);

          await saveActivity({
            id: nanoid(),
            type,
            source,
            standard,
            accountAddress,
            message,
            timeAt: Date.now(),
            pending: 0,
          });

          rpcCtx?.reply({ result: signature });
        },
      )
      .with(
        { type: ActivityType.AddNetwork },
        async ({ rpcCtx, source, chainId }) => {
          const origin = getPageOrigin(source);
          await repo.createOrUpdateNetworkPermission(origin, chainId);

          rpcCtx?.reply({ result: null });
        },
      )
      .otherwise(() => {
        throw new Error("Not Found");
      });
  } else {
    approval.rpcCtx?.reply({
      error: ethErrors.provider.userRejectedRequest(),
    });
  }

  approvalResolved(approvalId);
}

async function pushTransaction(chainId: number, signedTx: ethers.Transaction) {
  const res = await sendRpc(chainId, "eth_sendRawTransaction", [
    signedTx.serialized,
  ]);

  if ("result" in res) {
    try {
      const defNet = DEFAULT_NETWORKS.find((n) => n.chainId === chainId);
      const restToPush = defNet?.rpcUrls.slice(1, 4);

      if (restToPush) {
        for (const rpcUrl of restToPush) {
          fetch(rpcUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              jsonrpc: "2.0",
              id: 1,
              method: "eth_sendRawTransaction",
              params: [signedTx.serialized],
            }),
          }).then((res) => {
            if (!res.ok) {
              console.error("Failed to push tx to another rpc", res);
            }
          });
        }
      }
    } catch (err) {
      console.error(err);
    }
  }

  return res;
}
