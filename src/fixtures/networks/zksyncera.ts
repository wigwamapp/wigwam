import { Network } from "core/types";

export const ZKSYNCERA: Network[] = [
  // Mainnet
  {
    chainId: 324,
    type: "mainnet",
    rpcUrls: ["https://mainnet.era.zksync.io"],
    chainTag: "zksyncera",
    name: "zkSync Era",
    nativeCurrency: {
      symbol: "ETH",
      name: "Ether",
      decimals: 18,
    },
    explorerUrls: ["https://explorer.zksync.io"],
    faucetUrls: [],
    parent: {
      type: "L2",
      chain: "eip155-1",
      bridges: [{ url: "https://bridge.zksync.io/" }],
    },
    infoUrl: "https://era.zksync.io",
  },

  // Testnets
  {
    chainId: 280,
    type: "testnet",
    rpcUrls: ["https://testnet.era.zksync.dev"],
    chainTag: "zksyncera",
    name: "zkSync Era Testnet",
    nativeCurrency: {
      symbol: "ETH",
      name: "Ether",
      decimals: 18,
    },
    explorerUrls: ["https://goerli.explorer.zksync.io"],
    faucetUrls: ["https://goerli.portal.zksync.io/faucet"],
    parent: {
      type: "L2",
      chain: "eip155-1",
      bridges: [{ url: "https://goerli.portal.zksync.io/bridge" }],
    },
    infoUrl: "https://era.zksync.io",
  },
];
