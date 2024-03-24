import { Network } from "core/types";

export const ETHEREUM: Network[] = [
  // Mainnet
  {
    chainId: 1,
    type: "mainnet",
    rpcUrls: [
      "https://mainnet.infura.io/v3/${INFURA_API_KEY}",
      "https://eth.llamarpc.com",
      "https://rpc.ankr.com/eth",
      "https://cloudflare-eth.com",
      "https://endpoints.omniatech.io/v1/eth/mainnet/public",
      "https://ethereum.publicnode.com",
      "https://1rpc.io/eth",
      "https://rpc.flashbots.net",
      "https://eth.meowrpc.com",
      "https://eth.drpc.org",
    ],
    chainTag: "ethereum",
    name: "Ethereum",
    nativeCurrency: {
      symbol: "ETH",
      name: "Ethereum",
      decimals: 18,
    },
    ensRegistry: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e",
    explorerUrls: ["https://etherscan.io"],
    explorerApiUrl: "https://api.etherscan.io/api",
    faucetUrls: [],
    infoUrl: "https://ethereum.org",
  },
];
