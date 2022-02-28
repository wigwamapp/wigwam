import { FC, useMemo, useState } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { waitForAll } from "jotai/utils";
import classNames from "clsx";
import Fuse from "fuse.js";

import { Account } from "core/types";

import { ACCOUNTS_SEARCH_OPTIONS } from "app/defaults";
import {
  accountAddressAtom,
  allAccountsAtom,
  currentAccountAtom,
} from "app/atoms";
import Select from "app/components/elements/Select";
import AutoIcon from "app/components/elements/AutoIcon";
import HashPreview from "app/components/elements/HashPreview";
import Balance from "app/components/elements/Balance";

type AccountSelectProps = {
  className?: string;
};

const AccountSelect: FC<AccountSelectProps> = ({ className }) => {
  const { currentAccount, allAccounts } = useAtomValue(
    useMemo(
      () =>
        waitForAll({
          currentAccount: currentAccountAtom,
          allAccounts: allAccountsAtom,
        }),
      []
    )
  );
  const setAccountAddress = useSetAtom(accountAddressAtom);

  const [searchValue, setSearchValue] = useState<string | null>(null);
  const fuse = useMemo(
    () => new Fuse(allAccounts, ACCOUNTS_SEARCH_OPTIONS),
    [allAccounts]
  );

  const preparedAccounts = useMemo(() => {
    if (searchValue) {
      return fuse
        .search(searchValue)
        .map(({ item: network }) => prepareAccount(network));
    } else {
      return allAccounts.map((network) => prepareAccount(network));
    }
  }, [fuse, allAccounts, searchValue]);

  const preparedCurrentAccount = useMemo(
    () => prepareCurrentAccount(currentAccount),
    [currentAccount]
  );

  return (
    <Select
      items={preparedAccounts}
      currentItem={preparedCurrentAccount}
      setItem={(account) => setAccountAddress(account.key)}
      searchValue={searchValue}
      onSearch={setSearchValue}
      currentItemClassName={classNames("!px-3", className)}
    />
  );
};

export default AccountSelect;

type AccountSelectItemProps = {
  account: Account;
};

const CurrentAccount: FC<AccountSelectItemProps> = ({ account }) => (
  <span className="flex items-center text-left w-full pr-3">
    <AutoIcon
      seed={account.address}
      source="dicebear"
      type="personas"
      className={classNames(
        "h-8 w-8 min-w-[2rem]",
        "mr-3",
        "bg-black/20",
        "rounded-[.625rem]"
      )}
    />
    <span className="flex flex-col">
      <span>{account.name}</span>
      <HashPreview
        hash={account.address}
        className="text-xs text-brand-light font-normal leading-4 mt-auto"
        withTooltip={false}
      />
    </span>
    <span className="flex flex-col items-end ml-auto">
      <span className="inline-flex min-h-[1.25rem] mt-auto">
        <Balance address={account.address} />
      </span>
      <span className="text-xs leading-4 text-brand-inactivedark font-normal mt-auto">
        $ 22,478.34
      </span>
    </span>
  </span>
);

const AccountSelectItem: FC<AccountSelectItemProps> = ({ account }) => (
  <span className="flex items-center text-left w-full">
    <AutoIcon
      seed={account.address}
      source="dicebear"
      type="personas"
      className={classNames(
        "h-8 w-8 min-w-[2rem]",
        "mr-3",
        "bg-black/20",
        "rounded-[.625rem]"
      )}
    />
    <span>{account.name}</span>
    <span className="flex flex-col items-end ml-auto">
      <HashPreview
        hash={account.address}
        className="text-sm text-brand-light font-normal leading-5"
        withTooltip={false}
      />
      <span className="inline-flex min-h-[1rem] mt-auto">
        <Balance
          address={account.address}
          className="text-xs text-brand-inactivedark font-normal"
        />
      </span>
    </span>
  </span>
);

const prepareCurrentAccount = (account: Account) => ({
  key: account.address,
  value: <CurrentAccount account={account} />,
});

const prepareAccount = (account: Account) => ({
  key: account.address,
  value: <AccountSelectItem account={account} />,
});
