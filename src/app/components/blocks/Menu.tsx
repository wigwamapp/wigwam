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
        <span className="pl-6 pr-4 text-sm text-white font-semibold inline-flex items-center justify-center">
          <div className="atom-spinner w-8 h-8" />
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
    "off",
  );

  return (
    <>
      {totalBalance ? (
        <FiatAmount
          amount={totalBalance}
          copiable
          className="text-[1.75rem] tracking-wider font-bold leading-none"
        />
      ) : null}
    </>
  );
};
