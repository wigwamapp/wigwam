import { FC, useLayoutEffect } from "react";
import { match } from "ts-pattern";
import { useResource } from "lib/resax";

import { WalletStatus } from "core/types";
import { walletStatusRes } from "app/resources";

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
  const walletStatus = useResource(walletStatusRes);

  return match(walletStatus)
    .with(WalletStatus.Ready, () => <Confirm />)
    .with(WalletStatus.Locked, () => <Unlock />)
    .otherwise(() => <Close />);
};

const Close: FC = () => {
  useLayoutEffect(() => window.close(), []);
  return null;
};
