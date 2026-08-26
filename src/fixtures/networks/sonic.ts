import { Network } from "core/types";

export const SONIC: Network[] = [
  // Mainnet
  {
    chainId: 146,
    type: "mainnet",
    rpcUrls: [
      "https://rpc.soniclabs.com",
      "https://sonic-rpc.publicnode.com",
      "https://sonic.drpc.org",
      "https://sonic.api.pocket.network",
      "https://sonic-json-rpc.stakely.io",
      "https://sonic-mainnet.rpc.sentio.xyz",
    ],
    chainTag: "sonic",
    name: "Sonic",
    nativeCurrency: {
      symbol: "S",
      name: "Sonic",
      decimals: 18,
    },
    explorerUrls: ["https://sonicscan.org", "https://explorer.soniclabs.com"],
    explorerApiUrl: "https://api.etherscan.io/v2/api?chainid=146",
    faucetUrls: [],
    infoUrl: "https://soniclabs.com",
  },
];
