import { FC, useMemo, useRef, useState } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { waitForAll } from "jotai/utils";
import classNames from "clsx";
import Fuse from "fuse.js";
import { useCopyToClipboard } from "lib/react-hooks/useCopyToClipboard";

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
import Tooltip from "app/components/elements/Tooltip";
import { ReactComponent as SuccessIcon } from "app/icons/success.svg";
import { ReactComponent as CopyIcon } from "app/icons/copy.svg";

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
      contentClassName="!min-w-[22.25rem]"
    />
  );
};

export default AccountSelect;

type AccountSelectItemProps = {
  account: Account;
};

const CurrentAccount: FC<AccountSelectItemProps> = ({ account }) => {
  const fieldRef = useRef<HTMLInputElement>(null);
  const { copy, copied } = useCopyToClipboard(fieldRef);

  return (
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
      <input
        ref={fieldRef}
        value={account.address}
        onChange={() => undefined}
        className="sr-only"
      />
      <Tooltip
        content={
          copied
            ? "Wallet address copied to clipboard"
            : "Copy wallet address to clipboard"
        }
        asChild
      >
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */}
        <span
          onClick={(e) => {
            e.stopPropagation();
            copy();
          }}
          className={classNames(
            "px-1 -my-1",
            "text-left",
            "rounded",
            "max-w-full",
            "flex flex-col",
            "transition-colors",
            "hover:bg-brand-main/40 focus-visible:bg-brand-main/40"
          )}
        >
          <span className="font-bold">{account.name}</span>
          <span className="flex items-center mt-auto">
            <HashPreview
              hash={account.address}
              className="text-xs text-brand-light font-normal leading-4 mr-1"
              withTooltip={false}
            />
            {copied ? (
              <SuccessIcon className="w-[1.125rem] h-auto" />
            ) : (
              <CopyIcon className="w-[1.125rem] h-auto" />
            )}
          </span>
        </span>
      </Tooltip>
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
};

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
