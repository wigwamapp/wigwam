import { useEffect } from "react";
import { useQuery } from "react-query";
import { match } from "ts-pattern";
import { browser } from "webextension-polyfill-ts";

import { WalletStatus } from "core/types";
import { walletStatusQuery } from "app/queries";

import BaseProvider from "./BaseProvider";
import Unlock from "./pages/Unlock";
import Popup from "./pages/Popup";

const PopupApp: React.FC = () => (
  <BaseProvider>
    <PopupRouter />
  </BaseProvider>
);

export default PopupApp;

const PopupRouter: React.FC = () => {
  const walletStatus = useQuery(walletStatusQuery).data!;

  return match(walletStatus)
    .with(WalletStatus.Ready, () => <Popup />)
    .with(WalletStatus.Locked, () => <Unlock />)
    .otherwise(() => <OpenInTab />);
};

const OpenInTab: React.FC = () => {
  useEffect(() => {
    browser.tabs.create({
      url: browser.runtime.getURL("index.html"),
      active: true,
    });
    window.close();
  }, []);

  return null;
};
