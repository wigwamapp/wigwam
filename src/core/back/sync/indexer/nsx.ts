/**
 * NS-Indexer = "NSx"
 */

import { indexerApi } from "core/common/indexerApi";

export const fetchAccountNFTs = async (
  chainId: number,
  accountAddress: string,
) => {
  const { data } = await indexerApi.get<NSxResponse>(
    `/ns/v2/account/own/all/${accountAddress}`,
    {
      params: {
        _authAddress: accountAddress,
        chainId,
        show_attribute: false,
        sort_field: "latest_trade_price",
      },
    },
  );

  if (data.code === 200 && data.data) return data.data;

  throw new Error(data.msg || "Unknown error");
};

export interface NSxResponse {
  code: number;
  msg?: null;
  data?: NSxCollection[] | null;
}

export interface NSxCollection {
  contract_address: string;
  contract_name?: string | null;
  logo_url?: string | null;
  owns_total: number;
  items_total: number;
  symbol?: string | null;
  description?: string | null;
  floor_price?: number | null;
  verified: boolean;
  opensea_verified: boolean;
  is_spam: boolean;
  assets?: NSxToken[] | null;
}

export interface NSxToken {
  contract_address: string;
  contract_name?: string | null;
  contract_token_id: string;
  token_id: string;
  erc_type: string;
  amount: string;
  minter?: string | null;
  owner?: string | null;
  own_timestamp?: number | null;
  mint_timestamp: number;
  mint_transaction_hash: string;
  mint_price?: number | null;
  token_uri?: string | null;
  metadata_json?: string | null;
  name?: string | null;
  content_type?: string | null;
  content_uri?: string | null;
  description?: string | null;
  image_uri?: string | null;
  external_link?: string | null;
  latest_trade_price?: number | null;
  latest_trade_symbol?: string | null;
  latest_trade_token?: null;
  latest_trade_timestamp?: number | null;
  nftscan_id: string;
  nftscan_uri?: string | null;
  small_nftscan_uri?: string | null;
  attributes?: null[] | null;
  rarity_score?: number | null;
  rarity_rank?: number | null;
}
