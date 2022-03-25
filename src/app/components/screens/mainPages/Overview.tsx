import { FC } from "react";

import WalletsList from "app/components/blocks/WalletsList";
import OverviewContent from "app/components/blocks/OverviewContent";

const Overview: FC = () => {
  return (
    <>
      <WalletsList />
      <OverviewContent />
    </>
  );
};

export default Overview;
