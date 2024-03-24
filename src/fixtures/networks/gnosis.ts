import { Network } from "core/types";

export const GNOSIS: Network[] = [
  // Mainnet
  {
    chainId: 100,
    type: "mainnet",
    rpcUrls: [
      "https://rpc.gnosischain.com",
      "https://rpc.ankr.com/gnosis",
      "https://gnosis.publicnode.com",
      "https://1rpc.io/gnosis",
      "https://endpoints.omniatech.io/v1/gnosis/mainnet/public",
      "https://rpc.gnosis.gateway.fm",
      "https://gnosis-pokt.nodies.app",
      "https://gnosis-mainnet.public.blastapi.io",
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
    explorerApiUrl: "https://api.gnosisscan.io/api",
    faucetUrls: [
      "https://gnosisfaucet.com",
      "https://stakely.io/faucet/gnosis-chain-xdai",
      "https://faucet.prussia.dev/xdai",
    ],
    infoUrl: "https://docs.gnosischain.com/",
  },
];
