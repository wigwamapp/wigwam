import retry from "async-retry";
import memoize from "mem";
import { ethers, getAddress } from "ethers";
import { schedule } from "lib/system/schedule";

import {
  AccountAsset,
  ActivityType,
  RpcResponse,
  TransactionActivity,
  TxReceipt,
} from "core/types";
import * as repo from "core/repo";
import {
  createAccountTokenKey,
  NATIVE_TOKEN_SLUG,
  parseTokenSlug,
  ZERO_ADDRESSES,
} from "core/common/tokens";
import { matchTokenTransferEvents } from "core/common/transaction";

import { sendRpc, getRpcProvider } from "../rpc";
import { isUnlocked, $accountAddresses } from "../state";
import { addFindTokenRequest } from "../sync";

export async function startTxObserver() {
  schedule(5_000, async () => {
    if (!isUnlocked()) return;

    const pendingTxs = (await repo.activities
      .where("[type+pending]")
      .equals([ActivityType.Transaction, 1])
      .toArray()) as TransactionActivity[];

    if (pendingTxs.length === 0) return;

    const accountAddresses = $accountAddresses.getState();
    const txsToUpdate = new Map<string, TransactionActivity>();
    const completeHashes = new Set<string>();

    await Promise.all(
      pendingTxs.map(async (tx) => {
        if (tx.type !== ActivityType.Transaction) return;

        try {
          const result: TxReceipt = await retry(
            () =>
              sendRpc(tx.chainId, "eth_getTransactionReceipt", [
                tx.txHash,
              ]).then(unwrapRpcResponse),
            { retries: 3, maxTimeout: 1_000 },
          );

          const updatedTx: TransactionActivity = {
            ...tx,
            result,
          };

          if (result && result.blockNumber) {
            updatedTx.timeAt = Date.now();
            updatedTx.gasTokenPriceUSD = await getGasTokenPriceUSD(
              tx.chainId,
              tx.accountAddress,
            );

            completeHashes.add(tx.txHash);

            const skippedHashes = findSkippedTxs(tx, pendingTxs);
            for (const hash of skippedHashes) {
              completeHashes.add(hash);
            }

            if (!isFailedStatus(result)) {
              try {
                const transfers = await matchTokenTransferEvents(
                  getRpcProvider(tx.chainId),
                  result.logs,
                );

                for (const transfer of transfers) {
                  for (const transferAddress of [transfer.to, transfer.from]) {
                    const formatedAddress = getAddress(transferAddress);
                    const tokenAddress = parseTokenSlug(
                      transfer.tokenSlug,
                    ).address;

                    if (
                      accountAddresses.includes(formatedAddress) &&
                      !ZERO_ADDRESSES.has(tokenAddress)
                    ) {
                      addFindTokenRequest(
                        tx.chainId,
                        formatedAddress,
                        transfer.tokenSlug,
                      );
                    }
                  }
                }
              } catch (err) {
                console.error(err);
              }
            }

            addFindTokenRequest(
              tx.chainId,
              tx.accountAddress,
              NATIVE_TOKEN_SLUG,
            );

            const destination = result.to && getAddress(result.to);

            if (destination && accountAddresses.includes(destination)) {
              addFindTokenRequest(tx.chainId, destination, NATIVE_TOKEN_SLUG);
            }
          }

          txsToUpdate.set(tx.txHash, updatedTx);
        } catch (err) {
          console.error(err);
        }
      }),
    );

    for (const hash of completeHashes) {
      if (txsToUpdate.has(hash)) {
        txsToUpdate.get(hash)!.pending = 0;
      }
    }

    await repo.activities.bulkPut(Array.from(txsToUpdate.values()));

    await Promise.all(
      Array.from(completeHashes).map(async (txHash) => {
        try {
          const tx = txsToUpdate.get(txHash)!;
          const base = repo.tokenActivities.where({ txHash, pending: 1 });

          return await (isFailedOrSkippedTx(tx)
            ? base.delete()
            : base.modify((tokenActivity) => {
                tokenActivity.pending = 0;
              }));
        } catch {
          return;
        }
      }),
    );
  });
}

const getGasTokenPriceUSD = memoize(
  (chainId: number, accountAddress: string) =>
    repo.accountTokens
      .get(
        createAccountTokenKey({
          chainId,
          accountAddress,
          tokenSlug: NATIVE_TOKEN_SLUG,
        }),
      )
      .then((token) => (token as AccountAsset)?.priceUSD)
      .catch(() => undefined),
  { maxAge: 3 * 60_000 },
);

function findSkippedTxs(
  origin: TransactionActivity,
  allPending: TransactionActivity[],
) {
  const skippedHashes: string[] = [];

  for (const tx of allPending) {
    if (
      tx.txHash !== origin.txHash &&
      tx.chainId === origin.chainId &&
      tx.accountAddress == origin.accountAddress
    ) {
      const { nonce: originNonce } = ethers.Transaction.from(origin.rawTx);
      const { nonce: txNonce } = ethers.Transaction.from(tx.rawTx);

      if (originNonce >= txNonce) {
        skippedHashes.push(tx.txHash);
      }
    }
  }

  return skippedHashes;
}

function unwrapRpcResponse(res: RpcResponse) {
  if ("error" in res) {
    throw new Error(res.error.message);
  }

  return res.result;
}

function isFailedOrSkippedTx(tx: TransactionActivity) {
  return !tx.result || isFailedStatus(tx.result);
}

function isFailedStatus(result: TxReceipt) {
  return BigInt(result.status) === 0n;
}
