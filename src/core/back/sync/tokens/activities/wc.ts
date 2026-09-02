import { getAddress } from "ethers";
import BigNumber from "bignumber.js";

import { AccountToken, TokenActivityBase } from "core/types";
import { NATIVE_TOKEN_SLUG } from "core/common/tokens";
import { getNetwork } from "core/common/network";
import {
  fetchWcAccountHistory,
  isWcApiEnabled,
  toWcChainId,
  WcHistoryItem,
} from "core/common/walletConnectApi";

import { getLatestTokenActivity, prepareTokenActivitiesRepo } from "./utils";

/** A page holds 50 items, a full backfill is not the goal here */
const INITIAL_PAGES = 2;
const INCREMENTAL_PAGES = 1;

/**
 * WalletConnect (Zerion) Token Activities sync
 * Only for the native token.
 *
 * The api describes a transfer with `fungible_info: { name, symbol, icon }`
 * and never exposes the token contract address, so an activity cannot be
 * attributed to a `tokenSlug`. The native token is the one asset that can be
 * recognised from the display data alone, everything else is left to the
 * explorer sync.
 */
export async function syncWcTokenActivities(token: AccountToken) {
  const { chainId, tokenSlug, accountAddress } = token;

  if (!isWcApiEnabled()) return;
  if (tokenSlug !== NATIVE_TOKEN_SLUG) return;

  const { nativeCurrency } = await getNetwork(chainId);
  const decimalsFactor = new BigNumber(10).pow(nativeCurrency.decimals);
  const wcChain = toWcChainId(chainId);

  const latestItem = await getLatestTokenActivity(token);
  const { addToActivities, releaseToRepo } = prepareTokenActivitiesRepo();

  const maxPages = latestItem ? INCREMENTAL_PAGES : INITIAL_PAGES;

  let cursor: string | undefined;
  let synced = false;

  for (let page = 0; page < maxPages; page++) {
    const { data, next } = await fetchWcAccountHistory(accountAddress, {
      chainId,
      cursor,
    });

    // Reached the api, even an empty history counts as a successful sync
    synced = true;

    if (data.length === 0) break;

    const reachedKnown = collectPage(data);
    if (reachedKnown || !next) break;

    cursor = next;
  }

  await releaseToRepo();

  return synced;

  function collectPage(items: WcHistoryItem[]) {
    for (const item of items) {
      const { metadata } = item;

      if (metadata.chain !== wcChain) continue;
      if (metadata.status !== "confirmed") continue;

      const timeAt = Date.parse(metadata.minedAt);
      if (!Number.isFinite(timeAt)) continue;

      // History is ordered by `minedAt` desc, so everything below is known
      if (latestItem && latestItem.timeAt >= timeAt) return true;

      const base: Omit<TokenActivityBase, "type"> = {
        chainId,
        accountAddress,
        tokenSlug,
        txHash: metadata.hash,
        pending: 0,
        timeAt,
      };

      if (metadata.application?.name) {
        base.project = {
          name: metadata.application.name,
          logoUrl: metadata.application.iconUrl,
        };
      }

      for (const transfer of item.transfers ?? []) {
        if (transfer.fungible_info?.symbol !== nativeCurrency.symbol) continue;

        const income = transfer.direction === "in";

        const anotherAddress = toChecksum(
          income ? metadata.sentFrom : metadata.sentTo,
        );
        if (!anotherAddress) continue;

        const amount = new BigNumber(transfer.quantity?.numeric ?? "0")
          .times(decimalsFactor)
          .integerValue();

        if (!amount.isFinite() || amount.isZero()) continue;

        addToActivities({
          ...base,
          type: "transfer",
          anotherAddress,
          // toFixed, not toString: BigNumber goes exponential on large values
          // and the repo sums amounts with BigInt(), which rejects that form
          amount: (income ? amount : amount.times(-1)).toFixed(0),
        });
      }
    }

    return false;
  }
}

function toChecksum(address: string | undefined) {
  try {
    return address ? getAddress(address) : null;
  } catch {
    return null;
  }
}
