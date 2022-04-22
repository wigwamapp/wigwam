import { FC } from "react";
import classNames from "clsx";
import { RESET } from "jotai/utils";
import { SetStateAction } from "jotai";

import { TReplace } from "lib/ext/i18n/react";
import { Account } from "core/types";

import ScrollAreaContainer from "app/components/elements/ScrollAreaContainer";
import Balance from "app/components/elements/Balance";
import HashPreview from "app/components/elements/HashPreview";
import AutoIcon from "app/components/elements/AutoIcon";
import { ReactComponent as ChevronRightIcon } from "app/icons/chevron-right.svg";

type WalletTabsProps = {
  setAccountAddress: (
    update: typeof RESET | SetStateAction<string | null>
  ) => void;
  currentAccount: Account;
  allAccounts: Account[];
  className?: string;
};

const WalletTabs: FC<WalletTabsProps> = ({
  setAccountAddress,
  currentAccount,
  allAccounts,
  className,
}) => (
  <ScrollAreaContainer
    className={classNames(
      "relative",
      "flex flex-col",
      "min-w-[21.75rem] ",
      "border-r border-brand-main/[.07]",
      className
    )}
    viewPortClassName="pb-20 rounded-t-[.625rem]"
    scrollBarClassName="py-0 pb-20 !right-1"
  >
    {allAccounts.map((acc) => (
      <WalletTab
        key={acc.address}
        active={acc.address === currentAccount.address}
        className="mb-2"
        account={acc}
        onClick={() => setAccountAddress(acc.address)}
      />
    ))}
  </ScrollAreaContainer>
);

export default WalletTabs;

type WalletTabProps = {
  account: Account;
  active?: boolean;
  className?: string;
  onClick: () => void;
};

const WalletTab: FC<WalletTabProps> = ({
  active,
  account: { name, address },
  className,
  onClick,
}) => {
  const classNamesList = classNames(
    "relative group",
    "min-w-[20.25rem]",
    "p-3",
    active && "bg-brand-main/10",
    "hover:bg-brand-main/5",
    "rounded-[.625rem]",
    "flex items-stretch",
    "text-left"
  );

  return (
    <button className={classNames(classNamesList, className)} onClick={onClick}>
      <AutoIcon
        seed={address}
        source="dicebear"
        type="personas"
        className={classNames(
          "h-14 w-14 min-w-[3.5rem]",
          "mr-3",
          "bg-black/20",
          "rounded-[.625rem]"
        )}
      />
      <span
        className={classNames(
          "flex flex-col",
          "text-base font-bold text-brand-light leading-none",
          "min-w-0",
          "transition-colors",
          "group-hover:text-brand-light",
          "group-focus-visible:text-brand-light"
        )}
      >
        <h3 className="overflow-ellipsis overflow-hidden whitespace-nowrap leading-[1.125rem] -mt-px">
          <TReplace msg={name} />
        </h3>
        <HashPreview
          hash={address}
          className="text-sm text-brand-inactivedark mt-0.5 font-normal leading-none"
          withTooltip={false}
        />
        <Balance address={address} className="mt-auto" />
        <ChevronRightIcon
          className={classNames(
            "absolute right-2 top-1/2 -translate-y-1/2",
            "transition",
            "group-hover:translate-x-0 group-hover:opacity-100",
            active && "translate-x-0 opacity-100",
            !active && "-translate-x-1.5 opacity-0"
          )}
        />
      </span>
    </button>
  );
};
