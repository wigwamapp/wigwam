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

  // Testnets
  {
    chainId: 5,
    type: "testnet",
    rpcUrls: [
      "https://goerli.infura.io/v3/${INFURA_API_KEY}",
      "https://ethereum-goerli.publicnode.com",
      "https://endpoints.omniatech.io/v1/eth/goerli/public",
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
      "https://endpoints.omniatech.io/v1/eth/sepolia/public",
      "https://ethereum-sepolia.publicnode.com",
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
