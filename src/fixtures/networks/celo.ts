import { INetwork } from "core/repo";

export const CELO: INetwork[] = [
  // Mainnet
  {
    chainId: 42220,
    type: "mainnet",
    rpcUrls: ["https://forno.celo.org"],
    chainTag: "celo",
    name: "Celo",
    nativeCurrency: {
      symbol: "CELO",
      name: "CELO",
      decimals: 18,
    },
    explorerUrls: ["https://explorer.celo.org"],
    faucetUrls: ["https://free-online-app.com/faucet-for-eth-evm-chains/"],
    infoUrl: "https://docs.celo.org/",
  },

  // Testnets
  {
    chainId: 44787,
    type: "testnet",
    rpcUrls: ["https://alfajores-forno.celo-testnet.org"],
    chainTag: "celo",
    name: "Celo Testnet Alfajores",
    nativeCurrency: {
      symbol: "CELO",
      name: "CELO",
      decimals: 18,
    },
    faucetUrls: [
      "https://celo.org/developers/faucet",
      "https://cauldron.pretoriaresearchlab.io/alfajores-faucet",
    ],
    infoUrl: "https://docs.celo.org/",
  },
  {
    chainId: 62320,
    type: "testnet",
    rpcUrls: ["https://baklava-forno.celo-testnet.org"],
    chainTag: "celo",
    name: "Celo Testnet Baklava",
    nativeCurrency: {
      symbol: "CELO",
      name: "CELO",
      decimals: 18,
    },
    faucetUrls: [
      "https://docs.google.com/forms/d/e/1FAIpQLSdfr1BwUTYepVmmvfVUDRCwALejZ-TUva2YujNpvrEmPAX2pg/viewform",
      "https://cauldron.pretoriaresearchlab.io/baklava-faucet",
    ],
    infoUrl: "https://docs.celo.org/",
  },
];
