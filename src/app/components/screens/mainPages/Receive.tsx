import { FC } from "react";

import WalletsList from "app/components/blocks/WalletsList";

const Receive: FC = () => {
  return (
    <>
      <WalletsList />

      <div className="p-4">
        <h3 className="font-bold text-2xl leading-none mb-6">Receive</h3>
      </div>
    </>
  );
};

export default Receive;
