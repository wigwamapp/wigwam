import { withOfflineCache } from "lib/ext/offlineCache";
import { indexerApi } from "./indexerApi";

export const getAllEvmNetworks = withOfflineCache(
  async () => {
    const res = await indexerApi.get<EvmNetwork[]>("/networks/all");
    return res.data;
  },
  {
    key: "all_networks",
    hotMaxAge: 5_000,
    coldMaxAge: 12 * 60 * 60_000, // 12h
  },
);

export type EvmNetwork = {
  chainId: number;
  name: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];

  // meta
  explorers?: {
    name: string;
    url: string;
    apiUrl?: string;
  }[];
  icon?: {
    url: string;
  };
  infoUrl?: string;
  testnet?: boolean;
  faucets?: string[];
};
