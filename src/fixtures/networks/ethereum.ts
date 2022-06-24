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
    chainId: 42,
    type: "testnet",
    rpcUrls: [
      "https://kovan.poa.network",
      "https://kovan.infura.io/v3/${INFURA_API_KEY}",
    ],
    chainTag: "ethereum",
    name: "Ethereum Testnet Kovan",
    nativeCurrency: {
      symbol: "KOV",
      name: "Kovan Ether",
      decimals: 18,
    },
    explorerUrls: ["https://kovan.etherscan.io"],
    explorerApiUrl: "https://api-kovan.etherscan.io/api",
    faucetUrls: [
      "https://faucet.kovan.network",
      "http://fauceth.komputing.org?chain=42",
      "https://gitter.im/kovan-testnet/faucet",
    ],
    infoUrl: "https://kovan-testnet.github.io/website",
  },
  {
    chainId: 3,
    type: "testnet",
    rpcUrls: ["https://ropsten.infura.io/v3/${INFURA_API_KEY}"],
    chainTag: "ethereum",
    name: "Ethereum Testnet Ropsten",
    nativeCurrency: {
      symbol: "ROP",
      name: "Ropsten Ether",
      decimals: 18,
    },
    ensRegistry: "0x112234455c3a32fd11230c42e7bccd4a84e02010",
    explorerUrls: ["https://ropsten.etherscan.io"],
    explorerApiUrl: "https://api-ropsten.etherscan.io/api",
    faucetUrls: ["http://fauceth.komputing.org?chain=3"],
    infoUrl: "https://github.com/ethereum/ropsten",
  },
  {
    chainId: 4,
    type: "testnet",
    rpcUrls: ["https://rinkeby.infura.io/v3/${INFURA_API_KEY}"],
    chainTag: "ethereum",
    name: "Ethereum Testnet Rinkeby",
    nativeCurrency: {
      symbol: "RIN",
      name: "Rinkeby Ether",
      decimals: 18,
    },
    ensRegistry: "0xe7410170f87102df0055eb195163a03b7f2bff4a",
    explorerUrls: ["https://rinkeby.etherscan.io"],
    explorerApiUrl: "https://api-rinkeby.etherscan.io/api",
    faucetUrls: [
      "https://rinkebyfaucet.com",
      "https://faucet.rinkeby.io",
      "http://fauceth.komputing.org?chain=4",
    ],
    infoUrl: "https://www.rinkeby.io",
  },
  {
    chainId: 5,
    type: "testnet",
    rpcUrls: [
      "https://rpc.goerli.mudit.blog",
      "https://goerli.infura.io/v3/${INFURA_API_KEY}",
    ],
    chainTag: "ethereum",
    name: "Ethereum Testnet Goerli",
    nativeCurrency: {
      symbol: "GOR",
      name: "Goerli Ether",
      decimals: 18,
    },
    ensRegistry: "0x112234455c3a32fd11230c42e7bccd4a84e02010",
    explorerUrls: ["https://goerli.etherscan.io"],
    explorerApiUrl: "https://api-goerli.etherscan.io/api",
    faucetUrls: [
      "https://goerli-faucet.slock.it",
      "https://faucet.goerli.mudit.blog",
      "http://fauceth.komputing.org?chain=5",
    ],
    infoUrl: "https://goerli.net/#about",
  },
];
