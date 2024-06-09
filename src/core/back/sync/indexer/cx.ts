import memoize from "mem";
import { AxiosResponse } from "axios";

import { TokenType } from "core/types";
import { indexerApi } from "core/common/indexerApi";

/**
 * C-Indexer = "Cx"
 */

export const fetchCxAccountTokens = async (
  chainId: number,
  accountAddress: string,
  tokenType: TokenType,
) => {
  const cxChain = await getCxChain(chainId);
  if (!cxChain) throw new Error("Chain not supported");

  const urlTail =
    tokenType === TokenType.Asset ? "balances_v2" : "balances_nft";
  const url = `/c/v1/${cxChain.name}/address/${accountAddress}/${urlTail}/`;

  const cxTokens = await indexerApi
    .get<CxItemsResponse<CxToken>>(url, {
      params: {
        _authAddress: accountAddress,
        "no-spam": true,
      },
    })
    .then(handleCxItemsResponse);

  return cxTokens;
};

export const getCxChain = memoize(async (chainId: number) => {
  try {
    const chainList = await fetchCxChainList();

    return chainList.find((c) => +c.chain_id === chainId);
  } catch (err) {
    console.error(err);
    return undefined;
  }
});

export const fetchCxChainList = memoize(
  () =>
    indexerApi
      .get<CxItemsResponse<CxChain>>("/c/v1/chains/")
      .then(handleCxItemsResponse),
  {
    maxAge: 60 * 60_000, // 1 hour
  },
);

function handleCxItemsResponse<T>(res: AxiosResponse<CxItemsResponse<T>, any>) {
  if (res.data?.error) {
    throw new Error(res.data.error_message || "Unknown c-indexer error");
  }

  return res.data?.data?.items ?? [];
}

export type CxItemsResponse<Item> = {
  data?: {
    items?: Item[] | null;
    pagination?: null;
  } | null;
  error: boolean;
  error_message?: null;
  error_code?: null;
};

export interface CxChain {
  name: string;
  chain_id: string;
  is_testnet: boolean;
  label: string;
}

export interface CxToken {
  contract_decimals?: number | null;
  contract_name?: string | null;
  contract_ticker_symbol?: string | null;
  contract_address: string;
  supports_erc?: string[] | null;
  logo_url?: string | null;
  contract_display_name?: string | null;
  logo_urls?: {
    token_logo_url: string;
    protocol_logo_url?: string | null;
    chain_logo_url: string;
  } | null;
  last_transferred_at?: string | null;
  native_token?: boolean | null;
  type: string;
  is_spam: boolean;
  balance: string;
  balance_24h: string;
  quote_rate?: number | null;
  quote_rate_24h?: number | null;
  quote?: number | null;
  pretty_quote?: string | null;
  quote_24h?: number | null;
  pretty_quote_24h?: string | null;
  protocol_metadata?: { protocol_name: string } | null;
  nft_data?: NftDataEntity[] | null;
  floor_price_quote?: number | null;
  pretty_floor_price_quote?: string | null;
  floor_price_native_quote?: number | null;
  last_transfered_at?: string | null;
}

export interface NftDataEntity {
  token_id: string;
  token_url?: string | null;
  original_owner?: string | null;
  external_data?: NFTExternalData | null;
  asset_cached: boolean;
  image_cached: boolean;
}

export interface NFTExternalData {
  name?: string | null;
  description?: string | null;
  asset_url?: string | null;
  asset_file_extension?: string | null;
  asset_mime_type?: string | null;
  asset_size_bytes?: string | null;
  image?: string | null;
  image_256?: string | null;
  image_512?: string | null;
  image_1024?: string | null;
  animation_url?: string | null;
  external_url?: string | null;
  attributes?: ({ trait_type: string; value: string } | null)[] | null;
}
