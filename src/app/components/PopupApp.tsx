import { FC, useLayoutEffect } from "react";
import { match } from "ts-pattern";
import { useAtomValue } from "jotai/utils";

import { WalletStatus } from "core/types";
import { walletStatusAtom } from "app/atoms";
import { openInTab } from "app/helpers";

import BaseProvider from "./BaseProvider";
import Unlock from "./pages/Unlock";
import Popup from "./pages/Popup";

const PopupApp: FC = () => (
  <BaseProvider>
    <PopupRouter />
  </BaseProvider>
);

export default PopupApp;

const PopupRouter: FC = () => {
  const walletStatus = useAtomValue(walletStatusAtom);

  return match(walletStatus)
    .with(WalletStatus.Ready, () => <Popup />)
    .with(WalletStatus.Locked, () => <Unlock />)
    .otherwise(() => <OpenInTab />);
};

const OpenInTab: FC = () => {
  useLayoutEffect(() => {
    openInTab();
  }, []);

  return null;
};
