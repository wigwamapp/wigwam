import { Network } from "core/types";

export const SCROLL: Network[] = [
  // Mainnet
  {
    chainId: 534352,
    type: "mainnet",
    rpcUrls: [
      "https://rpc.scroll.io",
      "https://rpc.ankr.com/scroll",
      "https://1rpc.io/scroll",
      "https://scroll.blockpi.network/v1/rpc/public",
      "https://scroll-mainnet.chainstacklabs.com",
      "https://rpc-scroll.icecreamswap.com",
    ],
    chainTag: "scroll",
    name: "Scroll",
    nativeCurrency: {
      symbol: "ETH",
      name: "Ethereum",
      decimals: 18,
    },
    explorerUrls: ["https://scrollscan.com", "https://blockscout.scroll.io"],
    explorerApiUrl: "https://api.scrollscan.com/api",
    parent: {
      type: "L2",
      chain: "eip155-1",
      bridges: [{ url: "https://scroll.io/bridge" }],
    },
    faucetUrls: [],
    infoUrl: "https://scroll.io/",
  },
];
