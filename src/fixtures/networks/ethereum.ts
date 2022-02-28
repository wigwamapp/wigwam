import { Network } from "core/types";

export const ETHEREUM: Network[] = [
  // Mainnet
  {
    chainId: 1,
    type: "mainnet",
    rpcUrls: [
      "https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
      "https://api.mycryptoapi.com/eth",
      "https://cloudflare-eth.com",
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
    faucetUrls: [],
    infoUrl: "https://ethereum.org",
  },

  // Testnets
  {
    chainId: 42,
    type: "testnet",
    rpcUrls: [
      "https://kovan.poa.network",
      "http://kovan.poa.network:8545",
      "https://kovan.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
    ],
    chainTag: "ethereum",
    name: "Ethereum Testnet Kovan",
    nativeCurrency: {
      symbol: "KOV",
      name: "Kovan Ether",
      decimals: 18,
    },
    explorerUrls: ["https://kovan.etherscan.io"],
    faucetUrls: [
      "https://faucet.kovan.network",
      "https://gitter.im/kovan-testnet/faucet",
    ],
  },
  {
    chainId: 3,
    type: "testnet",
    rpcUrls: ["https://ropsten.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161"],
    chainTag: "ethereum",
    name: "Ethereum Testnet Ropsten",
    nativeCurrency: {
      symbol: "ROP",
      name: "Ropsten Ether",
      decimals: 18,
    },
    ensRegistry: "0x112234455c3a32fd11230c42e7bccd4a84e02010",
    explorerUrls: ["https://ropsten.etherscan.io"],
    faucetUrls: ["https://faucet.ropsten.be"],
    infoUrl: "https://github.com/ethereum/ropsten",
  },
  {
    chainId: 4,
    type: "testnet",
    rpcUrls: ["https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161"],
    chainTag: "ethereum",
    name: "Ethereum Testnet Rinkeby",
    nativeCurrency: {
      symbol: "RIN",
      name: "Rinkeby Ether",
      decimals: 18,
    },
    ensRegistry: "0xe7410170f87102df0055eb195163a03b7f2bff4a",
    explorerUrls: ["https://rinkeby.etherscan.io"],
    faucetUrls: ["https://faucet.rinkeby.io"],
    infoUrl: "https://www.rinkeby.io",
  },
  {
    chainId: 5,
    type: "testnet",
    rpcUrls: [
      "https://rpc.goerli.mudit.blog",
      "https://rpc.slock.it/goerli",
      "https://goerli.prylabs.net",
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
    faucetUrls: [
      "https://goerli-faucet.slock.it",
      "https://faucet.goerli.mudit.blog",
    ],
    infoUrl: "https://goerli.net/#about",
  },
];
