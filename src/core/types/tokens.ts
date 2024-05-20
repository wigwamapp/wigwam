export enum TokenType {
  Asset = "ASSET",
  NFT = "NFT",
}

export enum TokenStandard {
  Native = "NATIVE",
  ERC20 = "ERC20",
  ERC721 = "ERC721",
  ERC777 = "ERC777",
  ERC1155 = "ERC1155",
}

export enum TokenStatus {
  Disabled,
  Enabled,
  Native,
}

export type AccountToken = AccountAsset | AccountNFT;

export type AccountAsset = Asset & AccountTokenFields;
export type AccountNFT = NFT & AccountTokenFields;

export type Token = Asset | NFT;

type AccountTokenFields = {
  accountAddress: string;
  status: TokenStatus;
  rawBalance: string;
  balanceUSD: number;
  portfolioUSD?: string;
  portfolioRefreshedAt?: number;
  syncedByChainAt?: number;
  manuallyStatusChanged?: boolean;
};

export interface TokenBase {
  chainId: number;
  tokenSlug: string;
  tokenType: TokenType;
}

export interface Asset extends TokenBase {
  tokenType: TokenType.Asset;
  decimals: number;
  name: string;
  symbol: string;
  logoUrl?: string;
  priceUSD?: string;
  priceUSDChange?: string;
  displaySymbol?: string;
  optimizedSymbol?: string;
  protocolId?: string;
}

export interface NFT extends TokenBase {
  tokenType: TokenType.NFT;
  contractAddress: string;
  tokenId: string;
  name: string;
  description?: string;
  thumbnailUrl?: string;
  contentUrl?: string;
  contentType?: NFTContentType;
  collectionId?: string;
  collectionName?: string;
  detailUrl?: string;
  priceUSD?: string;
  attributes?: {
    trait_type: string;
    value: string | number;
    display_type?: string;
  }[];
  tpId?: string;
}

export type NFTContentType = "image_url" | "video_url" | "audio_url";
