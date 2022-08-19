import { Network } from "core/types";

export const CELO: Network[] = [
  // Mainnet
  {
    chainId: 42220,
    type: "mainnet",
    rpcUrls: ["https://forno.celo.org", "https://rpc.ankr.com/celo"],
    chainTag: "celo",
    name: "Celo",
    nativeCurrency: {
      symbol: "CELO",
      name: "CELO",
      decimals: 18,
    },
    explorerUrls: ["https://explorer.celo.org"],
    explorerApiUrl: "https://explorer.celo.org/api",
    faucetUrls: [],
    infoUrl: "https://docs.celo.org/",
  },

  // Testnets
  {
    chainId: 44787,
    type: "testnet",
    rpcUrls: ["https://alfajores-forno.celo-testnet.org"],
    chainTag: "celo",
    name: "Alfajores Celo Testnet",
    nativeCurrency: {
      symbol: "CELO",
      name: "CELO",
      decimals: 18,
    },
    explorerUrls: ["https://alfajores-blockscout.celo-testnet.org"],
    explorerApiUrl: "https://alfajores-blockscout.celo-testnet.org/api",
    faucetUrls: [
      "https://celo.org/developers/faucet",
      "https://cauldron.pretoriaresearchlab.io/alfajores-faucet",
    ],
    infoUrl: "https://docs.celo.org/",
  },
  // {
  //   chainId: 62320,
  //   type: "testnet",
  //   rpcUrls: ["https://baklava-forno.celo-testnet.org"],
  //   chainTag: "celo",
  //   name: "Celo Testnet Baklava",
  //   nativeCurrency: {
  //     symbol: "CELO",
  //     name: "CELO",
  //     decimals: 18,
  //   },
  //   faucetUrls: ["https://cauldron.pretoriaresearchlab.io/baklava-faucet"],
  //   infoUrl: "https://docs.celo.org/",
  // },
];
