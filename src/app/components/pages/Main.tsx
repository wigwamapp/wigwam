import { FC } from "react";

import PageLayout from "app/components/layouts/PageLayout";
import WalletsList from "app/components/blocks/WalletsList";

const Main: FC = () => (
  <PageLayout>
    <WalletsList />
  </PageLayout>
);

export default Main;
