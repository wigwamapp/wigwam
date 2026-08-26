import { Network } from "core/types";

export const SCROLL: Network[] = [
  // Mainnet
  {
    chainId: 534352,
    type: "mainnet",
    rpcUrls: [
      "https://rpc.scroll.io",
      "https://1rpc.io/scroll",
      "https://public.1rpc.io/scroll",
      "https://scroll.drpc.org",
      "https://scroll.api.pocket.network",
      "https://scroll.api.onfinality.io/public",
      "https://scroll-public.nodies.app",
      "https://scroll.rpc.sentio.xyz",
    ],
    chainTag: "scroll",
    name: "Scroll",
    nativeCurrency: {
      symbol: "ETH",
      name: "Ethereum",
      decimals: 18,
    },
    explorerUrls: ["https://scrollscan.com", "https://blockscout.scroll.io"],
    explorerApiUrl: "https://scrollscan.com/api",
    parent: {
      type: "L2",
      chain: "eip155-1",
      bridges: [{ url: "https://scroll.io/bridge" }],
    },
    faucetUrls: [],
    infoUrl: "https://scroll.io/",
  },
];
