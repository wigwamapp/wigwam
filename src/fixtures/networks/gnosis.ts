import { Network } from "core/types";

export const GNOSIS: Network[] = [
  // Mainnet
  {
    chainId: 100,
    type: "mainnet",
    rpcUrls: [
      "https://rpc.gnosischain.com",
      "https://1rpc.io/gnosis",
      "https://gnosis.publicnode.com",
      "https://rpc.gnosis.gateway.fm",
      "https://gnosis.drpc.org",
      "https://gnosis-rpc.publicnode.com",
      "https://public.1rpc.io/gnosis",
      "https://gnosis.api.pocket.network",
    ],
    chainTag: "gnosis",
    name: "Gnosis",
    nativeCurrency: {
      symbol: "XDAI",
      name: "xDAI",
      decimals: 18,
    },
    explorerUrls: [
      "https://gnosisscan.io",
      "https://gnosis.blockscout.com",
      "https://gnosis.dex.guru",
    ],
    explorerApiUrl: "https://gnosis.blockscout.com/api",
    faucetUrls: [
      "https://gnosisfaucet.com",
      "https://stakely.io/faucet/gnosis-chain-xdai",
      "https://faucet.prussia.dev/xdai",
    ],
    infoUrl: "https://docs.gnosischain.com/",
  },
];
