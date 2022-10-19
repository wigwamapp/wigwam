import { Network } from "core/types";

export const ETHEREUM: Network[] = [
  // Mainnet
  {
    chainId: 1,
    type: "mainnet",
    rpcUrls: [
      "https://mainnet.infura.io/v3/${INFURA_API_KEY}",
      "https://cloudflare-eth.com",
      "https://eth-mainnet.public.blastapi.io",
      "https://rpc.ankr.com/eth",
      "https://rpc.flashbots.net",
      "https://main-light.eth.linkpool.io",
      "https://ethereumnodelight.app.runonflux.io",
      "https://main-rpc.linkpool.io",
      "https://api.mycryptoapi.com/eth",
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

  // Testnets
  {
    chainId: 5,
    type: "testnet",
    rpcUrls: [
      "https://goerli.infura.io/v3/${INFURA_API_KEY}",
      "https://rpc.goerli.mudit.blog",
    ],
    chainTag: "ethereum",
    name: "Goerli Ethereum Testnet",
    nativeCurrency: {
      symbol: "GOR",
      name: "Goerli Ether",
      decimals: 18,
    },
    ensRegistry: "0x112234455c3a32fd11230c42e7bccd4a84e02010",
    explorerUrls: ["https://goerli.etherscan.io"],
    explorerApiUrl: "https://api-goerli.etherscan.io/api",
    faucetUrls: [
      "https://goerlifaucet.com",
      "https://goerli-faucet.slock.it",
      "https://faucet.goerli.mudit.blog",
      "http://fauceth.komputing.org?chain=5",
    ],
    infoUrl: "https://goerli.net/#about",
  },
  {
    chainId: 11155111,
    type: "testnet",
    rpcUrls: [
      "https://sepolia.infura.io/v3/${INFURA_API_KEY}",
      "https://rpc.sepolia.org",
    ],
    chainTag: "ethereum",
    name: "Sepolia Ethereum Testnet",
    nativeCurrency: {
      symbol: "SEP",
      name: "Sepolia Ether",
      decimals: 18,
    },
    explorerUrls: [
      "https://sepolia.etherscan.io",
      "https://sepolia.otterscan.io",
    ],
    explorerApiUrl: "https://api-sepolia.etherscan.io/api",
    faucetUrls: ["http://fauceth.komputing.org?chain=11155111"],
    infoUrl: "https://sepolia.otterscan.io",
  },
];
