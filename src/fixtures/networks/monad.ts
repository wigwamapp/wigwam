import { Network } from "core/types";

export const MONAD: Network[] = [
  // Mainnet
  {
    chainId: 143,
    type: "mainnet",
    rpcUrls: [
      "https://rpc.monad.xyz",
      "https://rpc1.monad.xyz",
      "https://monad-mainnet.drpc.org",
      "https://monad-mainnet.api.onfinality.io/public",
      "https://monad-mainnet.rpc.sentio.xyz",
      "https://monad-rpc.huginn.tech",
    ],
    chainTag: "monad",
    name: "Monad",
    nativeCurrency: {
      symbol: "MON",
      name: "Monad",
      decimals: 18,
    },
    explorerUrls: ["https://monadscan.com", "https://monadvision.com"],
    explorerApiUrl: "https://api.etherscan.io/v2/api?chainid=143",
    faucetUrls: [],
    infoUrl: "https://monad.xyz",
  },
];
