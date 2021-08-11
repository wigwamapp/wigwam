import { FC } from "react";

import BaseProvider from "./BaseProvider";
import PageRouter from "./PageRouter";

const App: FC = () => (
  <BaseProvider>
    <PageRouter />
  </BaseProvider>
);

export default App;
