import { FC, useEffect } from "react";
import { useQuery } from "react-query";
import { match } from "ts-pattern";

import { WalletStatus } from "core/types";
import { walletStatusQuery } from "app/queries";
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
  const walletStatus = useQuery(walletStatusQuery).data!;

  return match(walletStatus)
    .with(WalletStatus.Ready, () => <Popup />)
    .with(WalletStatus.Locked, () => <Unlock />)
    .otherwise(() => <OpenInTab />);
};

const OpenInTab: FC = () => {
  useEffect(() => {
    openInTab();
  }, []);

  return null;
};
