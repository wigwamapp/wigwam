import { FC, useEffect, useState } from "react";

import PageLayout from "app/components/layouts/PageLayout";
import WalletsList from "app/components/blocks/WalletsList";
import OverviewContent from "app/components/blocks/OverviewContent";
import { useAccountTokens } from "app/hooks/tokens";
import { useAtomValue } from "jotai";
import { currentAccountAtom } from "app/atoms";
import { TokenType } from "core/types";

const Main: FC = () => {
  return (
    <PageLayout className="flex flex-col">
      <WalletsList />
      <OverviewContent />

      <Kek />
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
