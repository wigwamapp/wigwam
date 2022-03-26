import { FC } from "react";

import WalletsList from "app/components/blocks/WalletsList";

const Swap: FC = () => {
  return (
    <>
      <WalletsList />

      <div className="p-4">
        <h3 className="font-bold text-2xl leading-none mb-6">Swap</h3>
      </div>
    </>
  );
};

export default Swap;
