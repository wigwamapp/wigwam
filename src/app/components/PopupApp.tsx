import { FC, useLayoutEffect } from "react";
import { match } from "ts-pattern";
import { useAtomValue } from "jotai";

import { WalletStatus } from "core/types";
import { walletStateAtom } from "app/atoms";
import { useLocked } from "app/hooks";
import { openInTab } from "app/helpers";

import BaseProvider from "./BaseProvider";
import Unlock from "./screens/Unlock";
import Popup from "./screens/Popup";
import Dialog from "./blocks/Dialog";
import ActivityModal from "./blocks/activity/ActivityModal";
import ReceivePopup from "./blocks/ReceiveModal";

const PopupApp: FC = () => (
  <BaseProvider>
    <PopupRouter />
    <PopupModals />
  </BaseProvider>
);

export default PopupApp;

const PopupRouter: FC = () => {
  const { walletStatus } = useAtomValue(walletStateAtom);

  return match(walletStatus)
    .with(WalletStatus.Unlocked, () => <Popup />)
    .with(WalletStatus.Locked, () => <Unlock />)
    .otherwise(() => <OpenInTab />);
};

const PopupModals: FC = () => {
  const locked = useLocked();

  return (
    <>
      <Dialog small />
      {!locked && (
        <>
          <ActivityModal />
          <ReceivePopup />
        </>
      )}
    </>
  );
};

const OpenInTab: FC = () => {
  useLayoutEffect(() => {
    openInTab();
  }, []);

  return null;
};
