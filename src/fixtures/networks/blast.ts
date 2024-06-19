import { Network } from "core/types";

export const BLAST: Network[] = [
  // Mainnet
  {
    chainId: 81457,
    type: "mainnet",
    rpcUrls: [
      "https://rpc.blast.io",
      "https://rpc.ankr.com/blast",
      "https://blast.din.dev/rpc",
      "https://blastl2-mainnet.public.blastapi.io",
      "https://blast.blockpi.network/v1/rpc/public",
      "https://blast-rpc.publicnode.com",
      "https://blast.gasswap.org",
    ],
    chainTag: "blast",
    name: "Blast",
    nativeCurrency: {
      symbol: "ETH",
      name: "Ethereum",
      decimals: 18,
    },
    explorerUrls: ["https://blastscan.io", "https://blastexplorer.io"],
    explorerApiUrl: "https://api.blastscan.io/api",
    infoUrl: "https://blast.io",
    faucetUrls: [],
  },
];
