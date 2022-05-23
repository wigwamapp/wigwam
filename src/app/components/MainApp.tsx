import { FC } from "react";

import BaseProvider from "./BaseProvider";
import FullScreenRouter from "./FullScreenRouter";
import AddAccountModal from "./blocks/AddAccountModal";
import Dialog from "./blocks/Dialog";
import ContactsDialog from "./blocks/ContactsDialog";

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
    </>
  );
};
