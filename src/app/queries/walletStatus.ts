import { getWalletStatus } from "core/client";
import { query } from "./base";

export const walletStatusQuery = query({
  queryKey: "wallet-status",
  queryFn: getWalletStatus,
  refetchOnReconnect: false,
  staleTime: Infinity,
});
