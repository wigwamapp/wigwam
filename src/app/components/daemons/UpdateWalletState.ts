import { FC, useEffect } from "react";
import { useQueryClient, useQuery } from "react-query";
import { onWalletStatusUpdated } from "core/client";
import { walletStatusQuery } from "app/queries";

const UpdateWalletState: FC = () => {
  const queryClient = useQueryClient();

  useQuery(walletStatusQuery);

  useEffect(() => {
    return onWalletStatusUpdated((newWalletStatus) => {
      queryClient.setQueryData(walletStatusQuery.queryKey, newWalletStatus);
    });
  }, [queryClient]);

  return null;
};

export default UpdateWalletState;
