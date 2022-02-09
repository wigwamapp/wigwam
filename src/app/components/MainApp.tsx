import { FC } from "react";

import BaseProvider from "./BaseProvider";
import PageRouter from "./PageRouter";
import AddAccountModal from "./blocks/AddAccountModal";

const MainApp: FC = () => (
  <BaseProvider>
    <PageRouter />

    <Modals />
  </BaseProvider>
);

export default MainApp;

const Modals: FC = () => {
  return (
    <>
      <AddAccountModal />
    </>
  );
};
