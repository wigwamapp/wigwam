import { FC, Suspense, useEffect } from "react";

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

      <Suspense fallback={<KekFallback />}>
        <Kek />
      </Suspense>
    </PageLayout>
  );
};

export default Main;

const Kek: FC = () => {
  const currentAccount = useAtomValue(currentAccountAtom);
  const accountAssets = useAccountTokens(
    TokenType.Asset,
    currentAccount.address
  );

  useEffect(() => {
    console.info(accountAssets);
  }, [accountAssets]);

  return null;
};

const KekFallback: FC = () => {
  useEffect(() => {
    console.info("Suspense");
  }, []);

  return null;
};
