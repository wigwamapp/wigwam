import { isWalletHasSeedPhrase } from "core/client";
import { query } from "./base";

export const hasSeedPhraseQuery = query({
  queryKey: "has-seed-phrase",
  queryFn: isWalletHasSeedPhrase,
  refetchOnReconnect: false,
  staleTime: Infinity,
  refetchOnMount: true,
});
