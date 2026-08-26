import { Network } from "core/types";

export const PLASMA: Network[] = [
  // Mainnet
  {
    chainId: 9745,
    type: "mainnet",
    rpcUrls: [
      "https://rpc.plasma.to",
      "https://plasma.api.onfinality.io/public",
      "https://plasma-mainnet.gateway.tatum.io",
    ],
    chainTag: "plasma",
    name: "Plasma",
    nativeCurrency: {
      symbol: "XPL",
      name: "Plasma",
      decimals: 18,
    },
    explorerUrls: ["https://plasmascan.to"],
    explorerApiUrl:
      "https://api.routescan.io/v2/network/mainnet/evm/9745/etherscan/api",
    faucetUrls: [],
    infoUrl: "https://plasma.to",
  },
];
