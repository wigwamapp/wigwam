import { FC, useEffect } from "react";
import { useQueryClient, useQuery } from "react-query";
import { onWalletStatusUpdated } from "core/client";
import { walletStatusQuery } from "app/queries";

const UpdateWalletStatus: FC = () => {
  const queryClient = useQueryClient();

  useQuery(walletStatusQuery);

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
