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

export interface AccountToken {
  chainId: number;
  accountAddress: string;
  tokenSlug: string;
  balance?: string;
  balanceUSD?: string;
}

export interface AssetMetadata {
  chainId: number;
  tokenSlug: string;
  decimals: 6;
  name: string;
  symbol: string;
  logoUrl?: string;
  displaySymbol?: string;
  optimizedSymbol?: string;
  protocolId?: string;
}

export interface NFTMetadata {
  chainId: number;
  tokenSlug: string;
  // @TODO
}
