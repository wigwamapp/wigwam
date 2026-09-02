import axios from "axios";
import memoize from "mem";

import { getNetwork } from "core/common/network";

import { AccountAssetData } from "../tokens/account/types";

/**
 * Blockscout, the key-less source for account tokens and NFTs.
 *
 * Every instance serves both the etherscan-compatible `/api` and the richer
 * `/api/v2`, so the base is derived from the explorer already configured for
 * the network instead of being duplicated in a second list.
 */

const blockscoutApi = axios.create({ timeout: 60_000 });

/** Explorers that answer on `/api` but are not Blockscout */
const FOREIGN_API_HOSTS = ["api.etherscan.io", "api.routescan.io"];

/**
 * Public instances for chains whose configured explorer is not Blockscout, so
 * those chains get token and NFT discovery instead of nothing. Kept to hosts
 * verified to serve `/api/v2/addresses/{address}/token-balances`.
 */
const KNOWN_INSTANCES = new Map([
  [59144, "https://api-explorer.linea.build/api"], // linea
  [1666600000, "https://explorer.harmony.one/api"], // harmony
]);

const NFT_TYPES = "ERC-721,ERC-1155";
/** One page holds 50 items, enough for a wallet overview */
const NFT_MAX_PAGES = 4;

/** How long a chain keeps skipping v2 after it answered with an error */
const V2_COOLDOWN = 10 * 60_000;

/**
 * The fallback runs on an instance already known to be sick, and account syncs
 * are queued, so it gets a tighter leash than the default timeout.
 */
const V1_TIMEOUT = 20_000;

/** chainId -> when its v2 api last failed */
const v2FailedAt = new Map<number, number>();

/**
 * Etherscan-compatible api base of the chain's Blockscout instance, e.g.
 * `https://eth.blockscout.com/api`. The v2 tree hangs off the same base.
 */
export const getBlockscoutApiUrl = memoize(
  async (chainId: number): Promise<string | null> => {
    const { explorerApiUrl } = await getNetwork(chainId);
    const known = KNOWN_INSTANCES.get(chainId) ?? null;
    if (!explorerApiUrl) return known;

    let url: URL;
    try {
      url = new URL(explorerApiUrl);
    } catch {
      return known;
    }

    if (FOREIGN_API_HOSTS.includes(url.hostname)) return known;

    const path = url.pathname.replace(/\/$/, "");
    if (!path.endsWith("/api")) return known;

    return `${url.origin}${path}`;
  },
  { maxAge: 60 * 60_000 },
);

export async function supportsBlockscout(chainId: number) {
  return Boolean(await getBlockscoutApiUrl(chainId).catch(() => null));
}

/**
 * Account tokens, from v2 when the instance serves it.
 *
 * An instance can rot one api at a time: Base answers 500 for every v2
 * `/addresses` call while its v1 stays healthy. So a broken v2 falls back to
 * the older `tokenlist`, which carries no prices or logos — the assets sync
 * fills prices in from the dex sources anyway.
 */
export async function fetchAccountAssets(
  chainId: number,
  accountAddress: string,
): Promise<AccountAssetData[]> {
  const apiUrl = await getBlockscoutApiUrl(chainId);
  if (!apiUrl) throw new Error("Chain not supported");

  const failedAt = v2FailedAt.get(chainId);
  const skipV2 = failedAt !== undefined && Date.now() - failedAt < V2_COOLDOWN;

  if (!skipV2) {
    try {
      const assets = await fetchAccountAssetsV2(apiUrl, accountAddress);
      v2FailedAt.delete(chainId);
      return assets;
    } catch (err) {
      // Not worth retrying on every sync while the instance is down
      v2FailedAt.set(chainId, Date.now());
      console.warn("Blockscout v2 assets failed, falling back", chainId, err);
    }
  }

  return fetchAccountAssetsV1(apiUrl, accountAddress);
}

async function fetchAccountAssetsV2(
  apiUrl: string,
  accountAddress: string,
): Promise<AccountAssetData[]> {
  const { data } = await blockscoutApi.get<BsTokenBalance[]>(
    `${apiUrl}/v2/addresses/${accountAddress}/token-balances`,
  );

  if (!Array.isArray(data)) return [];

  const assets: AccountAssetData[] = [];

  for (const item of data) {
    const token = item?.token;
    // Instances on an older release carry `address` alone
    const address = token?.address_hash ?? token?.address;
    // NFTs come from a dedicated endpoint
    if (!address || token?.type !== "ERC-20") continue;

    const decimals = Number(token.decimals);
    const price = Number(token.exchange_rate);
    const hasPrice = Number.isFinite(price) && price > 0;

    assets.push({
      native_token: false,
      type: token.type,
      contract_address: address,
      contract_name: token.name ?? "",
      contract_ticker_symbol: token.symbol ?? "",
      contract_decimals: Number.isFinite(decimals) ? decimals : 18,
      logo_url: token.icon_url ?? "",
      balance: item.value ?? "0",
      // null, not 0 — callers test truthiness to detect a missing price
      quote_rate: hasPrice ? price : null,
      quote: null,
      is_spam: token.reputation === "scam",
      balance_24h: "0",
    });
  }

  return assets;
}

async function fetchAccountAssetsV1(
  apiUrl: string,
  accountAddress: string,
): Promise<AccountAssetData[]> {
  const { data } = await blockscoutApi.get<BsV1TokenListResponse>(apiUrl, {
    params: {
      module: "account",
      action: "tokenlist",
      address: accountAddress,
    },
    timeout: V1_TIMEOUT,
  });

  // Errors come back as `{ status: "0", result: null }`, e.g. when rate limited
  const items = data?.result;
  if (!Array.isArray(items)) return [];

  const assets: AccountAssetData[] = [];

  for (const item of items) {
    // The list mixes in NFTs, which come from a dedicated endpoint
    if (!item?.contractAddress || item.type !== "ERC-20") continue;

    // NFT rows carry an empty string here, so blank means "unknown", not 0
    const decimals = item.decimals ? Number(item.decimals) : NaN;

    assets.push({
      native_token: false,
      type: item.type,
      contract_address: item.contractAddress,
      contract_name: item.name ?? "",
      contract_ticker_symbol: item.symbol ?? "",
      contract_decimals: Number.isFinite(decimals) ? decimals : 18,
      logo_url: "",
      balance: item.balance ?? "0",
      quote_rate: null,
      quote: null,
      is_spam: false,
      balance_24h: "0",
    });
  }

  return assets;
}

export async function fetchAccountNFTs(
  chainId: number,
  accountAddress: string,
): Promise<NftCollection[]> {
  const apiUrl = await getBlockscoutApiUrl(chainId);
  if (!apiUrl) throw new Error("Chain not supported");

  const byContract = new Map<string, NftCollection>();
  let params: Record<string, unknown> = { type: NFT_TYPES };

  for (let page = 0; page < NFT_MAX_PAGES; page++) {
    const { data } = await blockscoutApi.get<BsNftResponse>(
      `${apiUrl}/v2/addresses/${accountAddress}/nft`,
      { params },
    );

    const items = data?.items;
    if (!Array.isArray(items) || items.length === 0) break;

    for (const item of items) {
      const token = item?.token;
      const address = token?.address_hash ?? token?.address;
      if (!token || !address || !item.id) continue;

      let collection = byContract.get(address);

      if (!collection) {
        collection = {
          contract_address: address,
          contract_name: token.name ?? null,
          symbol: token.symbol ?? null,
          logo_url: token.icon_url ?? null,
          assets: [],
        };
        byContract.set(address, collection);
      }

      collection.assets.push({
        contract_address: address,
        contract_name: token.name ?? null,
        token_id: item.id,
        // Consumers match on a lowercase `erc1155` / `erc721`
        erc_type: (item.token_type ?? "ERC-721").toLowerCase().replace("-", ""),
        amount: item.value ?? "1",
        name: item.metadata?.name ?? null,
        description: item.metadata?.description ?? null,
        image_uri: item.image_url ?? null,
        content_uri: item.media_url ?? item.animation_url ?? null,
        content_type: item.media_type ?? null,
        external_link: item.external_app_url ?? null,
        thumbnail_uri: item.thumbnails?.["250x250"] ?? null,
        attributes: item.metadata?.attributes ?? null,
        tp_id: `${address}_${item.id}`,
      });
    }

    const next = data?.next_page_params;
    if (!next) break;

    params = { type: NFT_TYPES, ...next };
  }

  return Array.from(byContract.values());
}

/** Shape consumed by the NFT sync */
export type NftCollection = {
  contract_address: string;
  contract_name?: string | null;
  symbol?: string | null;
  logo_url?: string | null;
  assets: NftAsset[];
};

export type NftAsset = {
  contract_address: string;
  contract_name?: string | null;
  token_id: string;
  erc_type: string;
  amount: string;
  name?: string | null;
  description?: string | null;
  image_uri?: string | null;
  content_uri?: string | null;
  content_type?: string | null;
  external_link?: string | null;
  thumbnail_uri?: string | null;
  attributes?: unknown[] | null;
  tp_id: string;
};

type BsToken = {
  address_hash?: string;
  address?: string;
  name?: string | null;
  symbol?: string | null;
  decimals?: string | null;
  icon_url?: string | null;
  exchange_rate?: string | null;
  reputation?: string | null;
  type?: string;
};

type BsTokenBalance = {
  token?: BsToken;
  value?: string;
  token_id?: string | null;
};

/** `/api?module=account&action=tokenlist`, the pre-v2 shape */
type BsV1TokenListResponse = {
  result?: {
    contractAddress?: string;
    name?: string | null;
    symbol?: string | null;
    decimals?: string | null;
    balance?: string;
    type?: string;
  }[];
};

type BsNftResponse = {
  items?: {
    id?: string;
    token?: BsToken;
    token_type?: string;
    value?: string;
    image_url?: string | null;
    media_url?: string | null;
    media_type?: string | null;
    animation_url?: string | null;
    external_app_url?: string | null;
    thumbnails?: Record<string, string> | null;
    metadata?: {
      name?: string;
      description?: string;
      attributes?: unknown[];
    } | null;
  }[];
  next_page_params?: Record<string, unknown> | null;
};
