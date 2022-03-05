import { FC } from "react";

import PageLayout from "app/components/layouts/PageLayout";
import WalletsList from "app/components/blocks/WalletsList";
import OverviewContent from "app/components/blocks/OverviewContent";

const Main: FC = () => {
  return (
    <PageLayout className="flex flex-col">
      <WalletsList />

      <OverviewContent />
    </PageLayout>
  );
};

export default Main;
