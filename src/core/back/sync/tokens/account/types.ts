/**
 * Normalised account asset, produced by every balance source
 * (WalletConnect, Blockscout) and consumed by the assets sync.
 */
export type AccountAssetData = {
  native_token: boolean;
  type: string;
  contract_address: string;
  contract_name: string;
  contract_ticker_symbol: string;
  contract_decimals: number;
  logo_url: string;
  balance: string;
  /** `null`, never 0 — callers test truthiness to detect a missing price */
  quote_rate: number | null;
  quote: number | null;
  is_spam: boolean;
  balance_24h: string;
};
