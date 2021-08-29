import { FC } from "react";

import BaseProvider from "./BaseProvider";
import PageRouter from "./PageRouter";

const MainApp: FC = () => (
  <BaseProvider>
    <PageRouter />
  </BaseProvider>
);

export default MainApp;
