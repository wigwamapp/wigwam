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

  // Testnets
  {
    chainId: 534351,
    type: "testnet",
    rpcUrls: [
      "https://sepolia-rpc.scroll.io",
      "https://rpc.ankr.com/scroll_sepolia_testnet",
      "https://scroll-testnet-public.unifra.io",
      "https://scroll-public.scroll-testnet.quiknode.pro",
      "https://scroll-sepolia.chainstacklabs.com",
      "https://scroll-sepolia.blockpi.network/v1/rpc/public",
    ],
    chainTag: "scroll",
    name: "Scroll Sepolia Testnet",
    nativeCurrency: {
      symbol: "ETH",
      name: "Sepolia Ether",
      decimals: 18,
    },
    explorerUrls: [
      "https://sepolia.scrollscan.dev",
      "https://sepolia-blockscout.scroll.io",
    ],
    explorerApiUrl: "https://api-sepolia.scrollscan.com/api",
    infoUrl: "https://scroll.io/",
    faucetUrls: [],
    parent: {
      type: "L2",
      chain: "eip155-11155111",
      bridges: [{ url: "https://scroll.io/bridge" }],
    },
  },
];
