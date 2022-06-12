import { FC, useEffect, useState } from "react";
import { useAtomValue } from "jotai";

import { currentAccountAtom } from "app/atoms";
import WalletTabs from "app/components/blocks/WalletTabs";
import EditWalletSection from "app/components/blocks/EditWalletSection";

const Wallets: FC = () => {
  const currentAccount = useAtomValue(currentAccountAtom);
  const [selectedAccount, setSelectedAccount] = useState(currentAccount);

  useEffect(() => setSelectedAccount(currentAccount), [currentAccount]);

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
