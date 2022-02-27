import { Network } from "core/types";

export const AVALANCHE: Network[] = [
  // Mainnet
  {
    chainId: 43114,
    type: "mainnet",
    rpcUrls: ["https://api.avax.network/ext/bc/C/rpc"],
    chainTag: "avalanche",
    name: "Avalanche",
    nativeCurrency: {
      symbol: "AVAX",
      name: "Avalanche",
      decimals: 18,
    },
    explorerUrls: ["https://cchain.explorer.avax.network"],
    faucetUrls: ["https://free-online-app.com/faucet-for-eth-evm-chains/"],
    infoUrl: "https://www.avax.network/",
  },

  // Testnets
  {
    chainId: 43113,
    type: "testnet",
    rpcUrls: ["https://api.avax-test.network/ext/bc/C/rpc"],
    chainTag: "avalanche",
    name: "Avalanche Testnet Fuji",
    nativeCurrency: {
      symbol: "AVAX",
      name: "Avalanche",
      decimals: 18,
    },
    faucetUrls: ["https://faucet.avax-test.network/"],
    infoUrl: "https://cchain.explorer.avax-test.network",
  },
];
