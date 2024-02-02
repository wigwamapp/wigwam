import { FC, Suspense } from "react";
import { useLazyAtomValue } from "lib/atom-utils";

import { getTotalAccountBalanceAtom } from "app/atoms";
import { useAccounts, useIsSyncing } from "app/hooks";
import FiatAmount from "app/components/elements/FiatAmount";
import ProfileButton from "app/components/elements/ProfileButton";

const Menu: FC = () => {
  const isSyncing = useIsSyncing();

  return (
    <div className="flex items-center py-2 border-b border-brand-main/[.07]">
      <Suspense>
        <TotalBalance />
      </Suspense>

      {isSyncing && (
        <span className="px-4 text-sm text-white font-semibold">
          Syncing...
        </span>
      )}

      <ProfileButton className="ml-auto" />
    </div>
  );
};

export default Menu;

const TotalBalance: FC = () => {
  const { currentAccount } = useAccounts();
  const totalBalance = useLazyAtomValue(
    getTotalAccountBalanceAtom(currentAccount.address),
  );

  return (
    <>
      {totalBalance ? (
        <FiatAmount
          amount={totalBalance}
          copiable
          className="text-[1.25rem] font-bold leading-none ml-4"
        />
      ) : null}
    </>
  );
};
