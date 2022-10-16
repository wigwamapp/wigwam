import { FC, useLayoutEffect } from "react";
import { match } from "ts-pattern";
import { useAtomValue } from "jotai";

import { WalletStatus } from "core/types";
import { walletStatusAtom } from "app/atoms";
import { useLocked } from "app/hooks";
import { openInTab } from "app/helpers";

import BaseProvider from "./BaseProvider";
import Unlock from "./screens/Unlock";
import Popup from "./screens/Popup";
import Dialog from "./blocks/Dialog";
import ActivityModal from "./blocks/ActivityModal";

const PopupApp: FC = () => {
  const locked = useLocked();

  return (
    <BaseProvider>
      <PopupRouter />
      <Dialog small />
      {!locked && <ActivityModal />}
    </BaseProvider>
  );
};

export default PopupApp;

const PopupRouter: FC = () => {
  const walletStatus = useAtomValue(walletStatusAtom);

  return match(walletStatus)
    .with(WalletStatus.Unlocked, () => <Popup />)
    .with(WalletStatus.Locked, () => <Unlock />)
    .otherwise(() => <OpenInTab />);
};

const OpenInTab: FC = () => {
  useLayoutEffect(() => {
    openInTab();
  }, []);

  return null;
};
