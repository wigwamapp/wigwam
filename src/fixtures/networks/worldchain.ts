import { Network } from "core/types";

export const WORLDCHAIN: Network[] = [
  // Mainnet
  {
    chainId: 480,
    type: "mainnet",
    rpcUrls: [
      "https://worldchain-mainnet.g.alchemy.com/public",
      "https://worldchain.drpc.org",
      "https://480.rpc.thirdweb.com",
      "https://worldchain-mainnet.gateway.tenderly.co",
    ],
    chainTag: "worldchain",
    name: "World Chain",
    nativeCurrency: {
      symbol: "ETH",
      name: "Ethereum",
      decimals: 18,
    },
    explorerUrls: [
      "https://worldscan.org",
      "https://worldchain-mainnet.explorer.alchemy.com",
    ],
    explorerApiUrl: "https://worldchain-mainnet.explorer.alchemy.com/api",
    faucetUrls: [],
    infoUrl: "https://world.org/world-chain",
  },
];
