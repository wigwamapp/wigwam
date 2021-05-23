import { getWalletStatus } from "core/client";

export const walletStatusQuery = {
  queryKey: "wallet-status",
  queryFn: getWalletStatus,
  refetchOnReconnect: false,
  staleTime: Infinity,
};
