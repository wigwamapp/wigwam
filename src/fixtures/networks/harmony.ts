import { Network } from "core/types";

export const HARMONY: Network[] = [
  // Mainnet
  {
    chainId: 1666600000,
    type: "mainnet",
    rpcUrls: [
      "https://api.harmony.one",
      "https://api.s0.t.hmny.io",
      "https://a.api.s0.t.hmny.io",
      "https://public.1rpc.io/one",
      "https://harmony-0.drpc.org",
      "https://1rpc.io/one",
    ],
    chainTag: "harmony",
    name: "Harmony One",
    nativeCurrency: {
      symbol: "ONE",
      name: "ONE",
      decimals: 18,
    },
    explorerUrls: ["https://explorer.harmony.one"],
    faucetUrls: [],
    infoUrl: "https://www.harmony.one/",
  },
];
