import { Network } from "core/types";

export const CRONOS: Network[] = [
  // Mainnet
  {
    chainId: 25,
    type: "mainnet",
    rpcUrls: [
      "https://cronos-evm.publicnode.com",
      "https://evm.cronos.org",
      "https://1rpc.io/cro",
    ],
    chainTag: "cronos",
    name: "Cronos",
    nativeCurrency: {
      symbol: "CRO",
      name: "Cronos",
      decimals: 18,
    },
    explorerUrls: ["https://cronos.org/explorer"],
    explorerApiUrl: "https://cronos.org/explorer/api",
    faucetUrls: [],
    infoUrl: "https://cronos.org",
  },
];
