import { Network } from "core/types";

export const BLAST: Network[] = [
  // Mainnet
  {
    chainId: 81457,
    type: "mainnet",
    rpcUrls: [
      "https://rpc.blast.io",
      "https://blast-rpc.publicnode.com",
      "https://blast.drpc.org",
      "https://blast.api.pocket.network",
      "https://blast-mainnet.rpc.sentio.xyz",
      "https://blast.gateway.tenderly.co",
    ],
    chainTag: "blast",
    name: "Blast",
    nativeCurrency: {
      symbol: "ETH",
      name: "Ethereum",
      decimals: 18,
    },
    explorerUrls: ["https://blastscan.io", "https://blastexplorer.io"],
    explorerApiUrl: "https://api.etherscan.io/v2/api?chainid=81457",
    infoUrl: "https://blast.io",
    faucetUrls: [],
  },
];
