import { FC, useEffect, useRef, useState } from "react";

import { useAccounts } from "app/hooks";

import WalletTabs from "app/components/blocks/WalletTabs";
import EditWalletSection from "app/components/blocks/EditWalletSection";

const Wallets: FC = () => {
  const { currentAccount } = useAccounts();

  const prevAccount = useRef(currentAccount);
  const [selectedAccount, setSelectedAccount] = useState(currentAccount);

  useEffect(() => {
    if (prevAccount.current.uuid !== currentAccount.uuid) {
      prevAccount.current = currentAccount;
      setSelectedAccount(currentAccount);
    }
  }, [currentAccount]);

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
