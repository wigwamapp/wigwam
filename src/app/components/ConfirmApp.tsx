import { FC, useEffect } from "react";
import { useQuery } from "react-query";
import { match } from "ts-pattern";

import { WalletStatus } from "core/types";
import { walletStatusQuery } from "app/queries";

import BaseProvider from "./BaseProvider";
import Unlock from "./pages/Unlock";
import Confirm from "./pages/Confirm";

const ConfirmApp: FC = () => (
  <BaseProvider>
    <ConfirmRouter />
  </BaseProvider>
);

export default ConfirmApp;

const ConfirmRouter: FC = () => {
  const walletStatus = useQuery(walletStatusQuery).data!;

  return match(walletStatus)
    .with(WalletStatus.Ready, () => <Confirm />)
    .with(WalletStatus.Locked, () => <Unlock />)
    .otherwise(() => <Close />);
};

const Close: FC = () => {
  useEffect(() => {
    window.close();
  }, []);

  return null;
};
