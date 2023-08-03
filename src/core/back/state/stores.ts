import { createStore, combine } from "effector";
import { ethErrors } from "eth-rpc-errors";

import { WalletStatus, Approval, Account, ActivityType } from "core/types";
import { getPageOrigin } from "core/common/permissions";

import { Vault } from "../vault";
import {
  inited,
  unlocked,
  locked,
  seedPhraseAdded,
  accountsUpdated,
  approvalAdded,
  approvalResolved,
  approvalsRejected,
  syncStarted,
  synced,
} from "./events";

export const $walletStatus = createStore(WalletStatus.Idle)
  .on(inited, (_s, vaultExists) =>
    vaultExists ? WalletStatus.Locked : WalletStatus.Welcome
  )
  .on(unlocked, () => WalletStatus.Unlocked)
  .on(locked, (state) =>
    state === WalletStatus.Unlocked ? WalletStatus.Locked : state
  );

export const $hasSeedPhrase = createStore(false)
  .on(unlocked, (_s, { hasSeedPhrase }) => hasSeedPhrase)
  .on(seedPhraseAdded, () => true)
  .on(locked, () => false);

export const $walletState = combine([$walletStatus, $hasSeedPhrase]);

export const $accountsState = createStore<{
  prev: Account[] | null;
  current: Account[];
}>({ prev: null, current: [] })
  .on(unlocked, (_s, { accounts }) => ({ prev: null, current: accounts }))
  .on(accountsUpdated, ({ current: prev }, accounts) => ({
    prev,
    current: accounts,
  }))
  .on(locked, () => ({ prev: null, current: [] }));

export const $accounts = $accountsState.map(({ current }) => current);

export const $vault = createStore<Vault | null>(null)
  .on(unlocked, (_s, { vault }) => vault)
  .on(locked, (prevVault) => {
    prevVault?.cleanup();

    return null;
  });

export const $syncPool = createStore<(number | string)[]>([])
  .on(syncStarted, (pool, chainId) => [...pool, chainId])
  .on(synced, (pool, chainId) => {
    const i = pool.indexOf(chainId);

    if (i > -1) {
      // Remove one element by index
      const copied = Array.from(pool);
      copied.splice(i, 1);
      return copied;
    }

    return pool;
  });

export const $syncStatus = $syncPool.map((pool) => Array.from(new Set(pool)));

export const $approvals = createStore<Approval[]>([])
  .on(approvalAdded, (approvals, newApproval) => {
    if (newApproval.type === ActivityType.Connection) {
      const newApprovalOrigin = getPageOrigin(newApproval.source);

      let index = 0;
      for (const approval of approvals) {
        if (
          approval.type === ActivityType.Connection &&
          getPageOrigin(approval.source) === newApprovalOrigin
        ) {
          return approvals.filter((a, i) => (i === index ? newApproval : a));
        }

        index++;
      }

      return [newApproval, ...approvals];
    }

    return [...approvals, newApproval];
  })
  .on(approvalResolved, (current, id) => current.filter((a) => a.id !== id))
  .on(approvalsRejected, (current, ids) => {
    let toReject, next;

    if (!ids) {
      toReject = current;
      next = [];
    } else {
      toReject = [];
      next = [];

      for (const approval of current) {
        if (ids.includes(approval.id)) {
          toReject.push(approval);
        } else {
          next.push(approval);
        }
      }
    }

    rejectApprovalsRpc(toReject);
    return next;
  })
  .on(locked, (current) => {
    rejectApprovalsRpc(current);
    return [];
  });

export const $accountAddresses = $accounts.map((accounts) =>
  accounts.map((acc) => acc.address)
);

function rejectApprovalsRpc(approvals: Approval[]) {
  try {
    for (const { rpcReply } of approvals) {
      rpcReply?.({
        error: ethErrors.provider.userRejectedRequest(),
      });
    }
  } catch {}
}
