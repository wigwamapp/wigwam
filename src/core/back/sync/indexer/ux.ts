import { U_INDEXER_CHAINS } from "fixtures/networks";

export const getUxChainName = (chainId: number) =>
  U_INDEXER_CHAINS.get(chainId);
