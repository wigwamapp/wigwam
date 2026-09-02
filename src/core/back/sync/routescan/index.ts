import axios from "axios";
import ExpiryMap from "expiry-map";

import { NFT, TokenStandard } from "core/types";
import { createTokenSlug } from "core/common/tokens";

import { getTokenMetadata } from "../chain";
import { AccountAssetData } from "../tokens/account/types";
import type { NftAsset, NftCollection } from "../blockscout";

/**
 * Routescan, the key-less multichain explorer api behind Snowtrace and the
 * other `*scan` explorers it hosts.
 *
 * Picks up chains Blockscout does not run at all — Avalanche above all, which
 * is synced on a fresh install — and ships prices with the balances.
 */

const routescanApi = axios.create({
  baseURL: "https://api.routescan.io/v2/network/mainnet/evm",
  timeout: 60_000,
});

/**
 * Chains answering on the holdings endpoints. Routescan indexes far more than
 * it exposes here, so every id was probed by hand: the rest reply
 * `BLOCKCHAIN_NOTFOUND` or `NO_BLOCKCHAINS_FOR_PARAMS`.
 */
const SUPPORTED_CHAIN_IDS = new Set([
  1, // ethereum
  288, // boba
  5000, // mantle
  9745, // plasma
  43114, // avalanche
  80094, // berachain
  81457, // blast
]);

/** The endpoints default to 25 items a page and cap out well above this */
const PAGE_LIMIT = 100;

/**
 * NFTs come back as a bare contract plus token id, so each one costs a
 * `tokenURI` call and a metadata fetch. Only the first page worth is filled
 * in; the rest still flow through to refresh balances of NFTs already stored.
 */
const NFT_METADATA_LIMIT = 30;

/** NFT metadata does not move, so a hit is worth keeping across syncs */
const metadataCache = new ExpiryMap<string, Partial<NFT>>(30 * 60_000);

export function supportsRoutescan(chainId: number) {
  return SUPPORTED_CHAIN_IDS.has(chainId);
}

export async function fetchAccountAssets(
  chainId: number,
  accountAddress: string,
): Promise<AccountAssetData[]> {
  if (!supportsRoutescan(chainId)) throw new Error("Chain not supported");

  const items = await fetchHoldings<RsErc20Holding>(
    chainId,
    accountAddress,
    "erc20-holdings",
  );

  const assets: AccountAssetData[] = [];

  for (const item of items) {
    if (!item?.tokenAddress) continue;

    const price = Number(item.tokenPrice);
    const hasPrice = Number.isFinite(price) && price > 0;
    const value = Number(item.tokenValueInUsd);

    assets.push({
      native_token: false,
      type: "ERC-20",
      contract_address: item.tokenAddress,
      contract_name: item.tokenName ?? "",
      contract_ticker_symbol: item.tokenSymbol ?? "",
      contract_decimals: Number.isFinite(item.tokenDecimals!)
        ? item.tokenDecimals!
        : 18,
      logo_url: "",
      balance: item.tokenQuantity ?? "0",
      // null, not 0 — callers test truthiness to detect a missing price
      quote_rate: hasPrice ? price : null,
      quote: Number.isFinite(value) && value > 0 ? value : null,
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
  if (!supportsRoutescan(chainId)) throw new Error("Chain not supported");

  const [erc721, erc1155] = await Promise.all([
    fetchHoldings<RsNftHolding>(chainId, accountAddress, "erc721-holdings"),
    fetchHoldings<RsNftHolding>(chainId, accountAddress, "erc1155-holdings"),
  ]);

  const holdings = [
    ...erc721.map((item) => ({ ...item, standard: TokenStandard.ERC721 })),
    ...erc1155.map((item) => ({ ...item, standard: TokenStandard.ERC1155 })),
  ].filter((item) => item?.tokenAddress && item.tokenId);

  const metadatas = await Promise.all(
    holdings
      .slice(0, NFT_METADATA_LIMIT)
      .map(({ tokenAddress, tokenId, standard }) =>
        fetchNftMetadata(chainId, standard, tokenAddress!, tokenId!),
      ),
  );

  const byContract = new Map<string, NftCollection>();

  holdings.forEach((holding, i) => {
    const address = holding.tokenAddress!;
    const metadata = metadatas[i];

    let collection = byContract.get(address);

    if (!collection) {
      collection = {
        contract_address: address,
        contract_name: holding.collectionName ?? null,
        symbol: holding.collectionSymbol ?? null,
        logo_url: null,
        assets: [],
      };
      byContract.set(address, collection);
    }

    const asset: NftAsset = {
      contract_address: address,
      contract_name: holding.collectionName ?? null,
      token_id: holding.tokenId!,
      // Consumers match on a lowercase `erc1155` / `erc721`
      erc_type:
        holding.standard === TokenStandard.ERC1155 ? "erc1155" : "erc721",
      amount: holding.balance ?? "1",
      name: metadata?.name ?? null,
      description: metadata?.description ?? null,
      image_uri: metadata?.thumbnailUrl ?? null,
      content_uri: metadata?.contentUrl ?? null,
      content_type: metadata?.contentType ?? null,
      external_link: metadata?.detailUrl ?? null,
      thumbnail_uri: metadata?.thumbnailUrl ?? null,
      attributes: metadata?.attributes ?? null,
      tp_id: `${address}_${holding.tokenId}`,
    };

    collection.assets.push(asset);
  });

  return Array.from(byContract.values());
}

async function fetchNftMetadata(
  chainId: number,
  standard: TokenStandard,
  address: string,
  id: string,
): Promise<Partial<NFT> | null> {
  const tokenSlug = createTokenSlug({ standard, address, id });
  const cacheKey = `${chainId}_${tokenSlug}`;

  const cached = metadataCache.get(cacheKey);
  if (cached) return cached;

  // The slug is an NFT one, so the erc20 branch of the union cannot happen
  const metadata = (await getTokenMetadata(chainId, tokenSlug).catch(
    () => null,
  )) as Partial<NFT> | null;

  // Only a hit is cached: a miss is usually a flaky gateway, worth retrying
  if (metadata) metadataCache.set(cacheKey, metadata);

  return metadata;
}

async function fetchHoldings<T>(
  chainId: number,
  accountAddress: string,
  endpoint: string,
): Promise<T[]> {
  const { data } = await routescanApi.get<RsHoldingsResponse<T>>(
    `/${chainId}/address/${accountAddress}/${endpoint}`,
    { params: { limit: PAGE_LIMIT } },
  );

  return Array.isArray(data?.items) ? data.items : [];
}

type RsHoldingsResponse<T> = {
  items?: T[];
  link?: { next?: string };
};

type RsErc20Holding = {
  tokenAddress?: string;
  tokenName?: string | null;
  tokenSymbol?: string | null;
  tokenDecimals?: number;
  tokenQuantity?: string;
  tokenPrice?: string | null;
  tokenValueInUsd?: string | null;
};

type RsNftHolding = {
  tokenAddress?: string;
  tokenId?: string;
  collectionName?: string | null;
  collectionSymbol?: string | null;
  /** ERC-1155 only, ERC-721 holdings are always a single item */
  balance?: string;
};
