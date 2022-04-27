import { FC, useState } from "react";
import { useAtomValue } from "jotai";

import { allAccountsAtom } from "app/atoms";
import WalletTabs from "app/components/blocks/WalletTabs";
import EditWalletSection from "app/components/blocks/EditWalletSection";

const Wallets: FC = () => {
  const accounts = useAtomValue(allAccountsAtom);
  const [selectedAccount, setSelectedAccount] = useState(accounts[0]);

  return (
    <div className="flex min-h-0 grow">
      <WalletTabs
        selectedAccount={selectedAccount}
        onAccountChange={setSelectedAccount}
        className="mt-5"
      />
      <EditWalletSection key={selectedAccount.uuid} account={selectedAccount} />
    </div>
  );
};

export default Wallets;
