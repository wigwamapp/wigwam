import BigNumber from "bignumber.js";
import { nanoid } from "nanoid";
import { match } from "ts-pattern";
import { ethers } from "ethers";
import { ethErrors } from "eth-rpc-errors";
import { dequal } from "dequal/lite";
import { assert } from "lib/system/assert";

import { INITIAL_NETWORK } from "fixtures/networks";
import {
  Activity,
  ActivityType,
  ApprovalResult,
  Permission,
  TxParams,
  TxActionType,
  TokenActivity,
  TxAction,
} from "core/types";
import * as repo from "core/repo";
import { saveNonce } from "core/common/nonce";
import { getPageOrigin, wrapPermission } from "core/common/permissions";
import { matchTxAction } from "core/common/transaction";
import { createTokenActivityKey } from "core/common/tokens";

import { Vault } from "../vault";
import { $accounts, $approvals, approvalResolved } from "../state";
import { sendRpc, getRpcProvider } from "../rpc";

const { serializeTransaction, parseTransaction, keccak256, hexValue } =
  ethers.utils;

export async function processApprove(
  approvalId: string,
  {
    approved,
    rawTx,
    signedRawTx,
    signedMessage,
    accountAddresses,
    overriddenChainId,
  }: ApprovalResult,
  vault: Vault
) {
  const approval = $approvals.getState().find((a) => a.id === approvalId);
  assert(approval, "Not Found");

  if (approved) {
    await match(approval)
      .with(
        { type: ActivityType.Connection },
        async ({
          type,
          source,
          returnSelectedAccount,
          preferredChainId,
          rpcReply,
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

          rpcReply?.({ result: [toReturn] });
        }
      )
      .with(
        { type: ActivityType.Transaction },
        async ({
          type,
          source,
          chainId,
          accountAddress,
          txParams,
          rpcReply,
        }) => {
          assert(rawTx || signedRawTx, "Transaction not provided");

          const tx = parseTxSafe(rawTx ?? signedRawTx!);
          validateTxOrigin(tx, txParams);

          if (!signedRawTx) {
            accountAddress = ethers.utils.getAddress(accountAddress);
            const account = getAccountSave(accountAddress);

            const signature = await vault.sign(account.uuid, keccak256(rawTx!));
            signedRawTx = serializeTransaction(tx, signature);
          } else {
            rawTx = serializeTransaction(tx);
          }

          if (
            process.env.NODE_ENV === "development" &&
            process.env.VIGVAM_DEV_BLOCK_TX_SEND === "true"
          ) {
            throw new Error("Blocked by VIGVAM_DEV_BLOCK_TX_SEND env variable");
          }

          const rpcRes = await sendRpc(chainId, "eth_sendRawTransaction", [
            signedRawTx,
          ]);

          if ("result" in rpcRes) {
            const txHash = rpcRes.result;
            const timeAt = Date.now();

            const txAction = await matchTxAction(
              getRpcProvider(chainId),
              txParams
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
                timeAt
              ),
            ]);

            rpcReply?.({ result: txHash });
          } else {
            console.warn(rpcRes.error);

            const { message, ...data } = rpcRes.error;
            const err = new Error(message);
            Object.assign(err, { data });

            throw err;
          }
        }
      )
      .with(
        { type: ActivityType.Signing },
        async ({
          type,
          source,
          standard,
          accountAddress,
          message,
          rpcReply,
        }) => {
          if (signedMessage) {
            rpcReply?.({ result: signedMessage });
            return;
          }

          accountAddress = ethers.utils.getAddress(accountAddress);
          const account = getAccountSave(accountAddress);

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

          rpcReply?.({ result: signature });
        }
      )
      .otherwise(() => {
        throw new Error("Not Found");
      });
  } else {
    approval.rpcReply?.({ error: DECLINE_ERROR });
  }

  approvalResolved(approvalId);
}

function getAccountSave(accountAddress: string) {
  const account = $accounts
    .getState()
    .find((a) => a.address === accountAddress);
  assert(account, "Account not found");

  return account;
}

async function saveActivity(activity: Activity) {
  // TODO: Add specific logic for speed-up or cancel tx
  await repo.activities.put(activity).catch(console.error);

  if (activity.type === ActivityType.Connection) {
    // Remove all early connections to the same origin
    const actOrigin = getPageOrigin(activity.source);

    repo.activities
      .where("[type+pending]")
      .equals([ActivityType.Connection, 0])
      .filter(
        (act) =>
          act.id !== activity.id && getPageOrigin(act.source) === actOrigin
      )
      .delete()
      .catch(console.error);
  }
}

async function saveTokenActivity(
  action: TxAction | null,
  chainId: number,
  accountAddress: string,
  txHash: string,
  timeAt: number
) {
  try {
    if (action) {
      const tokenActivities = new Map<string, TokenActivity>();
      const addToActivities = (activity: TokenActivity) => {
        const dbKey = createTokenActivityKey(activity);
        tokenActivities.set(dbKey, activity);
      };

      const base = {
        chainId,
        accountAddress,
        txHash,
        pending: 1,
        timeAt,
      };

      if (action.type === TxActionType.TokenTransfer) {
        for (const { slug: tokenSlug, amount } of action.tokens) {
          addToActivities({
            ...base,
            type: "transfer",
            anotherAddress: action.toAddress,
            amount: new BigNumber(amount).times(-1).toString(),
            tokenSlug,
          });
        }
      } else if (
        action.type === TxActionType.TokenApprove &&
        action.tokenSlug
      ) {
        addToActivities({
          ...base,
          type: "approve",
          anotherAddress: action.toAddress,
          tokenSlug: action.tokenSlug,
          amount: action.amount,
          clears: action.clears,
        });
      }

      if (tokenActivities.size > 0) {
        await repo.tokenActivities.bulkPut(
          Array.from(tokenActivities.values()),
          Array.from(tokenActivities.keys())
        );
      }
    }
  } catch (err) {
    console.error(err);
  }
}

const DECLINE_ERROR = ethErrors.provider.userRejectedRequest();

const STRICT_TX_PROPS = [
  "to",
  "data",
  "accessList",
  "chainId",
  "value",
] as const;

function validateTxOrigin(tx: ethers.Transaction, originTxParams: TxParams) {
  for (const key of STRICT_TX_PROPS) {
    const txValue = hexValueMaybe(tx[key]);
    const originValue = hexValueMaybe(originTxParams[key]);

    if (originValue) {
      assert(dequal(txValue, originValue), "Invalid transaction");
    }
  }
}

function hexValueMaybe<T>(smth: T) {
  if (smth === undefined) return;

  if (
    ethers.BigNumber.isBigNumber(smth) ||
    ["string", "number"].includes(typeof smth)
  ) {
    return hexValue(smth as any);
  }

  return smth;
}

function parseTxSafe(rawTx: ethers.BytesLike): ethers.Transaction {
  const tx = parseTransaction(rawTx);

  // Remove signature props
  delete tx.r;
  delete tx.v;
  delete tx.s;

  return tx;
}
