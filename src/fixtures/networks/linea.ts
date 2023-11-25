import { Network } from "core/types";

export const LINEA: Network[] = [
  // Mainnet
  {
    chainId: 59144,
    type: "mainnet",
    rpcUrls: [
      "https://rpc.linea.build",
      "https://linea.drpc.org",
      "https://1rpc.io/linea",
      "https://linea.blockpi.network/v1/rpc/public",
    ],
    chainTag: "linea",
    name: "Linea",
    nativeCurrency: {
      symbol: "ETH",
      name: "Ethereum",
      decimals: 18,
    },
    explorerUrls: [
      "https://lineascan.build",
      "https://explorer.linea.build",
      "https://linea.l2scan.co",
    ],
    explorerApiUrl: "https://api.lineascan.build/api",
    parent: {
      type: "L2",
      chain: "eip155-1",
      bridges: [{ url: "https://bridge.linea.build" }],
    },
    infoUrl: "https://linea.build",
    faucetUrls: [],
  },

  // Testnets
  {
    chainId: 59140,
    type: "testnet",
    rpcUrls: [
      "https://rpc.goerli.linea.build",
      "https://linea-goerli.infura.io/v3/${INFURA_API_KEY}",
    ],
    chainTag: "linea",
    name: "Linea Goerli Testnet",
    nativeCurrency: {
      symbol: "ETH",
      name: "Goerli Ether",
      decimals: 18,
    },
    explorerUrls: [
      "https://goerli.lineascan.build",
      "https://explorer.goerli.linea.build",
    ],
    explorerApiUrl: "https://api-testnet.lineascan.build/api",
    faucetUrls: ["https://faucetlink.to/goerli"],
    infoUrl: "https://linea.build",
    parent: {
      type: "L2",
      chain: "eip155-5",
      bridges: [
        {
          url: "https://goerli.hop.exchange/#/send?token=ETH&sourceNetwork=ethereum&destNetwork=linea",
        },
      ],
    },
  },
];
