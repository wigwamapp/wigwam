import { Network } from "core/types";

export const BERACHAIN: Network[] = [
  // Mainnet
  {
    chainId: 80094,
    type: "mainnet",
    rpcUrls: [
      "https://rpc.berachain.com",
      "https://berachain-rpc.publicnode.com",
      "https://berachain.drpc.org",
      "https://bera.api.pocket.network",
      "https://rpc.berachain-apis.com",
      "https://berachain.rpc.sentio.xyz",
    ],
    chainTag: "berachain",
    name: "Berachain",
    nativeCurrency: {
      symbol: "BERA",
      name: "Bera",
      decimals: 18,
    },
    explorerUrls: ["https://berascan.com", "https://beratrail.io"],
    explorerApiUrl:
      "https://api.routescan.io/v2/network/mainnet/evm/80094/etherscan/api",
    faucetUrls: [],
    infoUrl: "https://www.berachain.com",
  },
];
