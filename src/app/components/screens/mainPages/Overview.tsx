import { FC } from "react";

import OverviewContent from "app/components/blocks/OverviewContent";
import NetworksList from "app/components/blocks/NetworksList";

const Overview: FC = () => {
  return (
    <>
      <NetworksList />
      <OverviewContent />
    </>
  );
};

export default Overview;
