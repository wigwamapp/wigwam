import { FC, useEffect } from "react";
import { useQueryClient } from "react-query";
import { onWalletStatusUpdated } from "core/client";
import { useQueriesSuspense, walletStatusQuery } from "app/queries";

const UpdateWalletStatus: FC = () => {
  const queryClient = useQueryClient();

  useQueriesSuspense([walletStatusQuery]);

  useEffect(
    () =>
      onWalletStatusUpdated((newWalletStatus) => {
        queryClient.setQueryData(walletStatusQuery.queryKey, newWalletStatus);
      }),
    [queryClient]
  );

  return null;
};

export default UpdateWalletStatus;
