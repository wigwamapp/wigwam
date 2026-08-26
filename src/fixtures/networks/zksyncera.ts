import { Network } from "core/types";

export const ZKSYNCERA: Network[] = [
  // Mainnet
  {
    chainId: 324,
    type: "mainnet",
    rpcUrls: [
      "https://mainnet.era.zksync.io",
      "https://zksync.drpc.org",
      "https://public.1rpc.io/zksync2-era",
      "https://rpc.ankr.com/zksync_era",
      "https://zksync-era.api.pocket.network",
      "https://api.zan.top/zksync-mainnet",
      "https://zksync.api.onfinality.io/public",
    ],
    chainTag: "zksyncera",
    name: "zkSync Era",
    nativeCurrency: {
      symbol: "ETH",
      name: "Ether",
      decimals: 18,
    },
    explorerUrls: ["https://explorer.zksync.io"],
    explorerApiUrl: "https://zksync.blockscout.com/api",
    faucetUrls: [],
    parent: {
      type: "L2",
      chain: "eip155-1",
      bridges: [{ url: "https://bridge.zksync.io/" }],
    },
    infoUrl: "https://era.zksync.io",
  },
];
