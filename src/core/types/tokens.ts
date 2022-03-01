export enum TokenType {
  Asset = "ASSET",
  NFT = "NFT",
}

export enum TokenStandard {
  ERC20 = "ERC20",
  ERC721 = "ERC721",
  ERC777 = "ERC777",
  ERC1155 = "ERC1155",
}

export type AccountAsset = AccountToken & AssetMetadata;
export type AccountNFT = AccountToken & NFTMetadata;

export type TokenMetadata = AssetMetadata | NFTMetadata;

export interface AccountToken extends TokenBase {
  tokenSlug: string;
  balance?: string;
  balanceUSD?: string;
}

export interface TokenBase {
  chainId: number;
  tokenSlug: string;
  tokenType: TokenType;
}

export interface AssetMetadata extends TokenBase {
  tokenType: TokenType.Asset;
  decimals: 6;
  name: string;
  symbol: string;
  logoUrl?: string;
  displaySymbol?: string;
  optimizedSymbol?: string;
  protocolId?: string;
}

export interface NFTMetadata extends TokenBase {
  tokenType: TokenType.NFT;
  // @TODO
}
