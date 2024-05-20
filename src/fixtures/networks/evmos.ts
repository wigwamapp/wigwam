import { Network } from "core/types";

export const EVMOS: Network[] = [
  // Mainnet
  {
    chainId: 9001,
    type: "mainnet",
    rpcUrls: [
      "https://evmos.lava.build",
      "https://evmos-pokt.nodies.app",
      "https://eth.bd.evmos.org:8545",
      "https://evmos-evm.publicnode.com",
    ],
    chainTag: "evmos",
    name: "Evmos",
    nativeCurrency: {
      symbol: "EVMOS",
      name: "Evmos",
      decimals: 18,
    },
    explorerUrls: ["https://evm.evmos.org", "https://www.mintscan.io/evmos"],
    explorerApiUrl: "https://evm.evmos.org/api",
    faucetUrls: [],
    infoUrl: "https://evmos.org",
  },
];
