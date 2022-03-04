import { FC, useCallback, useEffect, useState } from "react";

import PageLayout from "app/components/layouts/PageLayout";
import WalletsList from "app/components/blocks/WalletsList";
import OverviewContent from "app/components/blocks/OverviewContent";
import { useAccountTokens } from "app/hooks/tokens";
import { useAtomValue } from "jotai";
import { currentAccountAtom } from "app/atoms";
import { TokenType } from "core/types";
import { useProvider } from "app/hooks";
import { ethers } from "ethers";

const Main: FC = () => {
  return (
    <PageLayout className="flex flex-col">
      <WalletsList />
      <OverviewContent />

      <Kek />
      <Lal />
    </PageLayout>
  );
};

export default Main;

const Kek: FC = () => {
  const currentAccount = useAtomValue(currentAccountAtom);

  const [search, setSearch] = useState("");

  const { tokens, loadMore, hasMore } = useAccountTokens(
    TokenType.Asset,
    currentAccount.address,
    { search, limit: 10 }
  );

  useEffect(() => {
    Object.assign(window, {
      kek: {
        setSearch,
        loadMore,
      },
    });

    console.info({ tokens, hasMore, search });
  }, [tokens, loadMore, hasMore, search, setSearch]);

  return null;
};

const Lal: FC = () => {
  const currentAccount = useAtomValue(currentAccountAtom);

  const provider = useProvider();

  const sendEther = useCallback(
    async (to: string, amount: string) => {
      const from = currentAccount.address;
      const signer = provider.getSigner(from);

      const readyTx = await signer.populateTransaction({
        from,
        to,
        value: ethers.utils.parseEther(amount),
      });

      const res = await signer.sendTransaction(readyTx);

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
