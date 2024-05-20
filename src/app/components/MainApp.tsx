import { FC } from "react";

import { useLocked } from "app/hooks";
import { ToastProvider } from "app/hooks/toast";

import BaseProvider from "./BaseProvider";
import FullScreenRouter from "./FullScreenRouter";

import Dialog from "./blocks/Dialog";
import ContactsDialog from "./blocks/ContactsDialog";
import AddAccountModal from "./blocks/AddAccountModal";
import ActivityModal from "./blocks/activity/ActivityModal";
import AddFundsOnRampModal from "./blocks/AddFundsOnRampModal";
import ReceivePopup from "./blocks/ReceiveModal";
// import AuthSignatureModal from "./blocks/AuthSignatureModal";

const MainApp: FC = () => (
  <BaseProvider>
    <ToastProvider>
      <FullScreenRouter />

      <Modals />
    </ToastProvider>
  </BaseProvider>
);

export default MainApp;

const Modals: FC = () => {
  const locked = useLocked();

  return (
    <>
      <Dialog />
      {!locked && (
        <>
          <ContactsDialog />
          <AddAccountModal />
          <ActivityModal />
          <ReceivePopup />
          <AddFundsOnRampModal />
          {/* <AuthSignatureModal /> */}
        </>
      )}
    </>
  );
};
