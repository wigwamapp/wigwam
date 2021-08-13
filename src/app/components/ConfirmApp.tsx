import { FC, useLayoutEffect } from "react";
import { match } from "ts-pattern";
import { useAtomValue } from "jotai/utils";

import { WalletStatus } from "core/types";
import { walletStatusAtom } from "app/atoms";

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
  const walletStatus = useAtomValue(walletStatusAtom);

  return match(walletStatus)
    .with(WalletStatus.Unlocked, () => <Confirm />)
    .with(WalletStatus.Locked, () => <Unlock />)
    .otherwise(() => <Close />);
};

const Close: FC = () => {
  useLayoutEffect(() => window.close(), []);
  return null;
};
