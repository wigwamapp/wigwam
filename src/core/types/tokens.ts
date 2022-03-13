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

export type AccountToken = AccountAsset | AccountNFT;

export type AccountAsset = Asset & AccountTokenFields;
export type AccountNFT = NFT & AccountTokenFields;

export type Token = Asset | NFT;

type AccountTokenFields = {
  accountAddress: string;
  disabled: number;
  rawBalance?: string;
  balanceUSD?: number;
};

export interface TokenBase {
  chainId: number;
  tokenSlug: string;
  tokenType: TokenType;
}

export interface Asset extends TokenBase {
  tokenType: TokenType.Asset;
  decimals: 6;
  name: string;
  symbol: string;
  logoUrl?: string;
  priceUSD?: string;
  displaySymbol?: string;
  optimizedSymbol?: string;
  protocolId?: string;
}

export interface NFT extends TokenBase {
  tokenType: TokenType.NFT;
  // @TODO
}
