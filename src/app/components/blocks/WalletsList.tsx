import { FC, useCallback, useMemo, useRef, useState } from "react";
import { useSetAtom } from "jotai";
import classNames from "clsx";
import Fuse from "fuse.js";
import Link from "lib/navigation/Link";

import { Account } from "core/types";

import { ACCOUNTS_SEARCH_OPTIONS } from "app/defaults";
import { accountAddressAtom } from "app/atoms";
import { useAccounts } from "app/hooks";
import LargeWalletCard from "app/components/elements/LargeWalletCard";
import Button from "app/components/elements/Button";
import WalletCard from "app/components/elements/WalletCard";
import ScrollAreaContainer from "app/components/elements/ScrollAreaContainer";
import SearchInput from "app/components/elements/SearchInput";
import { ReactComponent as AddWalletIcon } from "app/icons/add-wallet.svg";
import { ReactComponent as NoResultsFoundIcon } from "app/icons/no-results-found.svg";

const WalletsList: FC = () => {
  const { currentAccount, allAccounts } = useAccounts();

  const accountsWithoutCurrent = useMemo(
    () =>
      allAccounts.filter(({ address }) => address !== currentAccount.address),
    [allAccounts, currentAccount.address],
  );

  return (
    <div className="flex py-4 border-b border-brand-main/[.07]">
      <LargeWalletCard account={currentAccount} className="mr-6" />

      {accountsWithoutCurrent.length > 0 ? (
        <SearchableAccountsScrollArea accounts={accountsWithoutCurrent} />
      ) : (
        <EmptyWalletCard />
      )}
    </div>
  );
};

export default WalletsList;

const emptyClassBg = classNames(
  "h-3",
  "rounded bg-brand-main/10",
  "transition-colors",
  "group-hover:bg-brand-main/20 group-focus-visible:bg-brand-main/20",
);

const EmptyWalletCard: FC = () => (
  <div className="flex items-center">
    <Link
      to={{ addAccOpened: true }}
      merge
      className={"flex flex-col group cursor-pointer"}
    >
      <div
        className={classNames(
          "w-[14.5rem] min-w-[14.5rem]",
          "flex items-stretch",
          "bg-brand-main/5",
          "rounded-t-[.625rem]",
          "p-3",
          "transition-colors",
          "group-hover:bg-brand-main/10 group-focus-visible:bg-brand-main/10",
        )}
      >
        <div
          className={classNames(
            "!h-12 w-12 min-w-[3rem] mr-3",
            "!rounded-[.625rem]",
            emptyClassBg,
          )}
        />
        <span className="flex flex-col">
          <span className={classNames("w-24 mt-auto", emptyClassBg)} />
          <span className={classNames("mt-2 w-32 mb-2", emptyClassBg)} />
        </span>
      </div>
      <div
        className={classNames(
          "flex justify-center items-center",
          "py-1.5",
          "bg-brand-main/10",
          "rounded-b-[.625rem]",
          "transition-colors",
          "group-hover:bg-brand-main/20 group-focus-visible:bg-brand-main/20",
        )}
      >
        <AddWalletIcon />
        <span className="text-base font-bold whitespace-nowrap ml-2">
          Add wallet
        </span>
      </div>
    </Link>
  </div>
);

type SearchableAccountsScrollAreaProps = {
  accounts: Account[];
};

const SearchableAccountsScrollArea: FC<SearchableAccountsScrollAreaProps> = ({
  accounts,
}) => {
  const setAccountAddress = useSetAtom(accountAddressAtom);

  const [searchValue, setSearchValue] = useState<string | null>(null);

  const fuse = useMemo(
    () => new Fuse(accounts, ACCOUNTS_SEARCH_OPTIONS),
    [accounts],
  );

  const filteredAccounts = useMemo(() => {
    if (searchValue) {
      return fuse.search(searchValue).map(({ item: account }) => account);
    }
    return accounts;
  }, [accounts, fuse, searchValue]);

  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const changeAccount = useCallback(
    (address: string) => {
      setAccountAddress(address);
      setSearchValue(null);

      scrollAreaRef.current?.scrollTo({
        behavior: "smooth",
        top: 0,
        left: 0,
      });
    },
    [setAccountAddress, setSearchValue],
  );

  return (
    <div className="flex flex-col w-full min-w-0">
      <div className="flex items-center mb-3">
        <SearchInput
          searchValue={searchValue}
          toggleSearchValue={setSearchValue}
        />
        <Button
          to={{ addAccOpened: true }}
          merge
          theme="tertiary"
          className="ml-5 !py-2"
        >
          <AddWalletIcon className="h-6 w-auto mr-2" />
          Add wallet
        </Button>
      </div>
      {filteredAccounts.length > 0 ? (
        <ScrollAreaContainer
          ref={scrollAreaRef}
          className="pb-4 -mb-4"
          viewPortClassName="!flex rounded-[.625rem]"
          scrollBarClassName="w-full px-0"
          viewportAsChild
        >
          {filteredAccounts.map((account, i) => (
            <WalletCard
              key={account.address}
              account={account}
              onClick={() => changeAccount(account.address)}
              className={classNames(i !== accounts.length - 1 && "mr-4")}
            />
          ))}
        </ScrollAreaContainer>
      ) : (
        <div
          className={classNames(
            "flex justify-center items-center",
            "h-full mr-[11.25rem]",
            "border border-brand-light/[.05]",
            "rounded-[.625rem]",
            "text-sm text-brand-placeholder",
          )}
        >
          <NoResultsFoundIcon className="mr-5" />
          No results found
        </div>
      )}
    </div>
  );
};
