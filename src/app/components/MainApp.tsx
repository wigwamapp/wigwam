import { FC } from "react";

import BaseProvider from "./BaseProvider";
import FullScreenRouter from "./FullScreenRouter";

import Dialog from "./blocks/Dialog";
import ContactsDialog from "./blocks/ContactsDialog";
import AddAccountModal from "./blocks/AddAccountModal";
import ActivityModal from "./blocks/ActivityModal";

const MainApp: FC = () => (
  <BaseProvider>
    <FullScreenRouter />

    <Modals />
  </BaseProvider>
);

export default MainApp;

const Modals: FC = () => {
  return (
    <>
      <Dialog />
      <ContactsDialog />
      <AddAccountModal />
      <ActivityModal />
    </>
  );
};
