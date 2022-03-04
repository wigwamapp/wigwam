import { FC } from "react";

import PageLayout from "app/components/layouts/PageLayout";
import WalletsList from "app/components/blocks/WalletsList";

const Wallets: FC = () => {
  return (
    <PageLayout className="flex flex-col">
      <WalletsList />
      <h2>Wallets</h2>
    </PageLayout>
  );
};

export default Wallets;
