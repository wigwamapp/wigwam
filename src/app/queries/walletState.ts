import { getWalletStatus } from "core/client";
import { query } from "./base";

export const walletStateQuery = query({
  queryKey: "wallet-state",
  queryFn: () => getWalletStatus(),
  refetchOnReconnect: false,
  staleTime: Infinity,
});
