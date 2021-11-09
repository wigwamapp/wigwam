import { INetwork } from "core/repo";

export const HARMONY: INetwork[] = [
  // Mainnet
  {
    chainId: 1666600000,
    type: "mainnet",
    rpcUrls: ["https://api.harmony.one"],
    chainTag: "harmony",
    name: "Harmony One",
    nativeCurrency: {
      symbol: "ONE",
      name: "ONE",
      decimals: 18,
    },
    explorerUrls: ["https://explorer.harmony.one"],
    faucetUrls: ["https://free-online-app.com/faucet-for-eth-evm-chains/"],
    infoUrl: "https://www.harmony.one/",
  },

  // Testnets
  {
    chainId: 1666700000,
    type: "testnet",
    rpcUrls: ["https://api.s0.b.hmny.io"],
    chainTag: "harmony",
    name: "Harmony Testnet Shard 0",
    nativeCurrency: {
      symbol: "ONE",
      name: "ONE",
      decimals: 18,
    },
    explorerUrls: ["https://explorer.pops.one"],
    faucetUrls: ["https://faucet.pops.one"],
    infoUrl: "https://www.harmony.one/",
  },
  {
    chainId: 1666700001,
    type: "testnet",
    rpcUrls: ["https://api.s1.b.hmny.io"],
    chainTag: "harmony",
    name: "Harmony Testnet Shard 1",
    nativeCurrency: {
      symbol: "ONE",
      name: "ONE",
      decimals: 18,
    },
    faucetUrls: [],
    infoUrl: "https://www.harmony.one/",
  },
];
