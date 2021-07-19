import { QueryClient } from "react-query";
import { dequal } from "dequal/lite";

export const QUERY_CLIENT = new QueryClient({
  defaultOptions: {
    queries: {
      isDataEqual: dequal,
      staleTime: Infinity,
    },
  },
});

export const FONTS: [string, number[]][] = [["Inter", [300, 400, 600, 700]]];

export const BSC_CHAIN_ID = 56;
export const BSC_RPC_URLS = [
  "https://bsc-dataseed.binance.org/",
  "https://bsc-dataseed1.defibit.io/",
  "https://bsc-dataseed1.ninicoin.io/",
];

export enum SetupStep {
  Language = "language",
  ChooseAddAccountWay = "choose-add-account-way",
  CreateSeedPhrase = "create-seed-phrase",
  ImportSeedPhrase = "import-seed-phrase",
  VerifySeedPhrase = "verify-seed-phrase",
  AddHDAccount = "add-hd-account",
}
