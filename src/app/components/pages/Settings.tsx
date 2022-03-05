import { FC } from "react";

import PageLayout from "app/components/layouts/PageLayout";
import WalletsList from "app/components/blocks/WalletsList";

const Settings: FC = () => {
  return (
    <PageLayout className="flex flex-col">
      <WalletsList />
      <h2>Settings</h2>
    </PageLayout>
  );
};

export default Settings;
