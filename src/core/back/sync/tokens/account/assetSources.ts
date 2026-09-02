import BigNumber from "bignumber.js";

import {
  fetchWcAccountBalance,
  isWcApiEnabled,
  parseWcAssetAddress,
} from "core/common/walletConnectApi";

import {
  fetchAccountAssets as fetchBlockscoutAssets,
  supportsBlockscout,
} from "../../blockscout";
import {
  fetchAccountAssets as fetchRoutescanAssets,
  supportsRoutescan,
} from "../../routescan";
import { AccountAssetData } from "./types";

/**
 * Account balances, from the first source that answers with something.
 *
 * WalletConnect leads where it is configured: it covers more chains and ships
 * prices, but its balance endpoint needs an `Origin` header that chrome strips
 * from extension GET requests. That failure is silent — an empty list, not an
 * error — so an empty answer is treated as "no data", never as "no balance".
 *
 * Blockscout and Routescan then cover mostly disjoint sets of chains, so in
 * practice whichever serves the chain is the one that answers.
 */
export async function fetchAccountAssets(
  chainId: number,
  accountAddress: string,
): Promise<AccountAssetData[]> {
  const sources = [
    { serves: isWcApiEnabled(), fetch: fetchWcAssets },
    { serves: await supportsBlockscout(chainId), fetch: fetchBlockscoutAssets },
    { serves: supportsRoutescan(chainId), fetch: fetchRoutescanAssets },
  ].filter((source) => source.serves);

  // Nobody indexes this chain. Callers lean on that to tell "no source" apart
  // from "the account holds nothing", so it stays an error
  if (sources.length === 0) throw new Error("Chain not supported");

  let lastError: unknown;

  for (const { fetch } of sources) {
    try {
      const assets = await fetch(chainId, accountAddress);
      if (assets.length > 0) return assets;
    } catch (err) {
      lastError = err;
    }
  }

  // Only a source that serves the chain and still failed counts as an error;
  // sources agreeing the account is empty do not
  if (lastError) throw lastError;

  return [];
}

async function fetchWcAssets(
  chainId: number,
  accountAddress: string,
): Promise<AccountAssetData[]> {
  const balances = await fetchWcAccountBalance(accountAddress, chainId);
  const assets: AccountAssetData[] = [];

  for (const balance of balances) {
    // The native coin carries no address and is synced by a separate module
    const address = parseWcAssetAddress(balance.address);
    if (!address) continue;

    const decimals = Number(balance.quantity?.decimals);
    const safeDecimals = Number.isFinite(decimals) ? decimals : 18;

    // `numeric` is already divided by the decimals, the repo wants raw units
    const raw = new BigNumber(balance.quantity?.numeric ?? "0")
      .times(new BigNumber(10).pow(safeDecimals))
      .integerValue();

    const price = Number(balance.price);
    const value = Number(balance.value);

    assets.push({
      native_token: false,
      type: "ERC-20",
      contract_address: address,
      contract_name: balance.name ?? "",
      contract_ticker_symbol: balance.symbol ?? "",
      contract_decimals: safeDecimals,
      logo_url: balance.iconUrl ?? "",
      // toFixed, not toString: the latter switches to exponential notation
      // above 1e21 and the repo stores raw balances as plain digits
      balance: raw.isFinite() ? raw.toFixed(0) : "0",
      quote_rate: Number.isFinite(price) && price > 0 ? price : null,
      quote: Number.isFinite(value) && value > 0 ? value : null,
      is_spam: false,
      balance_24h: "0",
    });
  }

  return assets;
}
