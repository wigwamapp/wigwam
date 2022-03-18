import { FC } from "react";

import WalletsList from "app/components/blocks/WalletsList";

const Transfer: FC = () => {
  return (
    <>
      <WalletsList />

      <div className="p-4">
        <h3 className="font-bold text-2xl leading-none mb-6">Transfer</h3>
      </div>
    </>
  );
};

export default Transfer;
