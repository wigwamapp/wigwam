import { FC } from "react";

import { ToastProvider } from "app/hooks/toast";

import BaseProvider from "./BaseProvider";
import FullScreenRouter from "./FullScreenRouter";
import AddAccountModal from "./blocks/AddAccountModal";
import Dialog from "./blocks/Dialog";
import ContactsDialog from "./blocks/ContactsDialog";

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
  return (
    <>
      <Dialog />
      <ContactsDialog />
      <AddAccountModal />
    </>
  );
};
