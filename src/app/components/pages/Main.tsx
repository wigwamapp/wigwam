import { FC, useCallback, useEffect } from "react";

import PageLayout from "app/components/layouts/PageLayout";
import WalletsList from "app/components/blocks/WalletsList";
import OverviewContent from "app/components/blocks/OverviewContent";
import { useAtomValue } from "jotai";
import { currentAccountAtom } from "app/atoms";
import { useProvider } from "app/hooks";
import { ethers } from "ethers";

const Main: FC = () => {
  return (
    <PageLayout className="flex flex-col">
      <WalletsList />
      <OverviewContent />

      <Lal />
    </PageLayout>
  );
};

export default Main;

const Lal: FC = () => {
  const currentAccount = useAtomValue(currentAccountAtom);

  const provider = useProvider();

  const sendEther = useCallback(
    async (to: string, amount: string) => {
      const res = await provider
        .getSigner(currentAccount.address)
        .sendTransaction({
          to,
          value: ethers.utils.parseEther(amount),
        });

      return res;
    },
    [provider, currentAccount.address]
  );

  useEffect(() => {
    Object.assign(window, {
      lal: {
        sendEther,
      },
    });
  }, [sendEther]);

  return null;
};
