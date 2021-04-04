import { FC, useEffect } from "react";
import { useQueryClient, useQuery } from "react-query";
import { onWalletStatusUpdated } from "core/client";
import { walletStateQuery } from "app/queries";

const UpdateWalletState: FC = () => {
  const queryClient = useQueryClient();

  useQuery(walletStateQuery);

  useEffect(() => {
    return onWalletStatusUpdated((newWalletStatus) => {
      queryClient.setQueryData(walletStateQuery.queryKey, newWalletStatus);
    });
  }, [queryClient]);

  return null;
};

export default UpdateWalletState;
