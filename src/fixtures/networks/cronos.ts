import { Network } from "core/types";

export const CRONOS: Network[] = [
  // Mainnet
  {
    chainId: 25,
    type: "mainnet",
    rpcUrls: [
      "https://cronos-evm.publicnode.com",
      "https://evm.cronos.org",
      "https://1rpc.io/cro",
      "https://cronos-evm-rpc.publicnode.com",
      "https://public.1rpc.io/cro",
      "https://cronos.drpc.org",
      "https://cronos.rpc.sentio.xyz",
      "https://rpc.vvs.finance",
    ],
    chainTag: "cronos",
    name: "Cronos",
    nativeCurrency: {
      symbol: "CRO",
      name: "Cronos",
      decimals: 18,
    },
    explorerUrls: ["https://cronos.org/explorer"],
    faucetUrls: [],
    infoUrl: "https://cronos.org",
  },
];
