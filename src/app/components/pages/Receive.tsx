import { FC } from "react";

import PageLayout from "app/components/layouts/PageLayout";
import WalletsList from "app/components/blocks/WalletsList";

const Receive: FC = () => {
  return (
    <PageLayout className="flex flex-col">
      <WalletsList />
      <h2>Receive</h2>
    </PageLayout>
  );
};

export default Receive;
