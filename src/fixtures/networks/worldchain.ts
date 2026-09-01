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
    // The alchemy-hosted blockscout answers 500 on every api call, v1 and v2
    // alike, so the etherscan multichain api serves the data instead
    explorerApiUrl: "https://api.etherscan.io/v2/api?chainid=480",
    faucetUrls: [],
    infoUrl: "https://world.org/world-chain",
  },
];
