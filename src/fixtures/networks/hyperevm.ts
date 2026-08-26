import { Network } from "core/types";

export const HYPEREVM: Network[] = [
  // Mainnet
  {
    chainId: 999,
    type: "mainnet",
    rpcUrls: [
      "https://rpc.hyperliquid.xyz/evm",
      "https://rpc.hypurrscan.io",
      "https://hyperliquid.drpc.org",
      "https://hyperliquid.api.onfinality.io/evm/public",
      "https://hyperliquid-json-rpc.stakely.io",
      "https://hyperevm.rpc.sentio.xyz",
    ],
    chainTag: "hyperevm",
    name: "HyperEVM",
    nativeCurrency: {
      symbol: "HYPE",
      name: "Hype",
      decimals: 18,
    },
    explorerUrls: ["https://hyperevmscan.io"],
    explorerApiUrl: "https://api.etherscan.io/v2/api?chainid=999",
    faucetUrls: [],
    infoUrl: "https://hyperfoundation.org",
  },
];
