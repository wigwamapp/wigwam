import { Network } from "core/types";

export const BASE: Network[] = [
  // Mainnet
  {
    chainId: 8453,
    type: "mainnet",
    rpcUrls: [
      "https://mainnet.base.org",
      "https://base.llamarpc.com",
      "https://base.meowrpc.com",
      "https://base.drpc.org",
      "https://base.publicnode.com",
      "https://endpoints.omniatech.io/v1/base/mainnet/public",
    ],
    chainTag: "base",
    name: "Base",
    nativeCurrency: {
      symbol: "ETH",
      name: "Ethereum",
      decimals: 18,
    },
    explorerUrls: [
      "https://basescan.org",
      "https://base.blockscout.com",
      "https://base.dex.guru",
    ],
    explorerApiUrl: "https://api.basescan.org/api",
    faucetUrls: [],
    infoUrl: "https://base.org/",
  },

  // Testnets
  {
    chainId: 84531,
    type: "testnet",
    rpcUrls: [
      "https://goerli.base.org",
      "https://base-goerli.publicnode.com",
      "https://endpoints.omniatech.io/v1/base/goerli/public",
      "https://base-goerli.public.blastapi.io",
    ],
    chainTag: "base",
    name: "Base Goerli Testnet",
    nativeCurrency: {
      symbol: "ETH",
      name: "Goerli Ether",
      decimals: 18,
    },
    explorerUrls: [
      "https://goerli.basescan.org",
      "https://base-goerli.blockscout.com",
      "https://base-goerli.dex.guru",
    ],
    explorerApiUrl: "https://api-goerli.basescan.org/api",
    faucetUrls: [
      "https://www.coinbase.com/faucets/base-ethereum-goerli-faucet",
    ],
    infoUrl: "https://base.org",
  },
];
