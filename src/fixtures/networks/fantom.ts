import { Network } from "core/types";

export const FANTOM: Network[] = [
  // Mainnet
  {
    chainId: 250,
    type: "mainnet",
    rpcUrls: ["https://rpc.ftm.tools"],
    chainTag: "fantom",
    name: "Fantom",
    nativeCurrency: {
      symbol: "FTM",
      name: "Fantom",
      decimals: 18,
    },
    explorerUrls: ["https://ftmscan.com"],
    faucetUrls: ["https://free-online-app.com/faucet-for-eth-evm-chains/"],
    infoUrl: "https://fantom.foundation",
  },

  // Testnets
  {
    chainId: 4002,
    type: "testnet",
    rpcUrls: ["https://rpc.testnet.fantom.network"],
    chainTag: "fantom",
    name: "Fantom Testnet",
    nativeCurrency: {
      symbol: "FTM",
      name: "Fantom",
      decimals: 18,
    },
    explorerUrls: ["https://testnet.ftmscan.com/"],
    faucetUrls: ["https://faucet.fantom.network"],
    infoUrl:
      "https://docs.fantom.foundation/quick-start/short-guide#fantom-testnet",
  },
];
