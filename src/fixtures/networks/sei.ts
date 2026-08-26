import { Network } from "core/types";

export const SEI: Network[] = [
  // Mainnet
  {
    chainId: 1329,
    type: "mainnet",
    rpcUrls: [
      "https://evm-rpc.sei-apis.com",
      "https://sei.drpc.org",
      "https://sei.api.pocket.network",
      "https://sei-evm-rpc.stakeme.pro",
    ],
    chainTag: "sei",
    name: "Sei",
    nativeCurrency: {
      symbol: "SEI",
      name: "Sei",
      decimals: 18,
    },
    explorerUrls: ["https://seiscan.io"],
    explorerApiUrl: "https://api.etherscan.io/v2/api?chainid=1329",
    faucetUrls: [],
    infoUrl: "https://www.sei.io",
  },
];
