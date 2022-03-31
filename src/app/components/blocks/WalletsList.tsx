import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { waitForAll } from "jotai/utils";
import classNames from "clsx";
import Fuse from "fuse.js";

import { Account, AccountSource } from "core/types";

import { ACCOUNTS_SEARCH_OPTIONS } from "app/defaults";
import {
  accountAddressAtom,
  allAccountsAtom,
  currentAccountAtom,
  getNeuterExtendedKeyAtom,
} from "app/atoms";
import LargeWalletCard from "app/components/elements/LargeWalletCard";
import NewButton from "app/components/elements/NewButton";
import WalletCard from "app/components/elements/WalletCard";
import ScrollAreaContainer from "app/components/elements/ScrollAreaContainer";
import SearchInput from "app/components/elements/SearchInput";
import { ReactComponent as AddWalletIcon } from "app/icons/add-wallet.svg";
import { ReactComponent as NoResultsFoundIcon } from "app/icons/no-results-found.svg";
import { generatePreviewHDNodes } from "../../../core/common";
import { fromProtectedString } from "../../../lib/crypto-utils";
import { useMaybeAtomValue } from "../../../lib/atom-utils";
import { addAccounts } from "../../../core/client";
import { usePrevious } from "lib/react-hooks/usePrevious";

const WalletsList: FC = () => {
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

  const accountsWithoutCurrent = useMemo(
    () =>
      allAccounts.filter(({ address }) => address !== currentAccount.address),
    [allAccounts, currentAccount.address]
  );

  return (
    <div className="flex py-4 border-b border-brand-main/[.07]">
      <LargeWalletCard account={currentAccount} className="mr-6" />
      <SearchableAccountsScrollArea accounts={accountsWithoutCurrent} />
    </div>
  );
};

export default WalletsList;

const emptyClassBg = classNames(
  "h-3",
  "rounded bg-brand-main/10",
  "transition-colors",
  "group-hover:bg-brand-main/20 group-focus-visible:bg-brand-main/20"
);

const EmptyWalletCard: FC<{ onClick: () => void }> = ({ onClick }) => (
  <div className="flex items-center">
    <button
      className={"flex items-stretch group cursor-pointer"}
      onClick={onClick}
    >
      <div
        className={classNames(
          "w-[14.5rem] min-w-[14.5rem]",
          "flex items-stretch",
          "bg-brand-main/5",
          "rounded-l-[.625rem]",
          "p-3",
          "transition-colors",
          "group-hover:bg-brand-main/10 group-focus-visible:bg-brand-main/10"
        )}
      >
        <div
          className={classNames(
            "!h-14 w-14 min-w-[3.5rem] mr-3",
            "!rounded-[.625rem]",
            emptyClassBg
          )}
        />
        <span className="flex flex-col">
          <span className={classNames("w-24", emptyClassBg)} />
          <span className={classNames("mt-2 w-20", emptyClassBg)} />
          <span className={classNames("mt-auto w-32", emptyClassBg)} />
        </span>
      </div>
      <div
        className={classNames(
          "flex justify-center items-center",
          "px-3.5",
          "bg-brand-main/10",
          "rounded-r-[.625rem]",
          "transition-colors",
          "group-hover:bg-brand-main/20 group-focus-visible:bg-brand-main/20"
        )}
      >
        <AddWalletIcon />
      </div>
    </button>
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
    [accounts]
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
    [setAccountAddress, setSearchValue]
  );

  const prevAccountsLength = usePrevious(accounts.length);

  useEffect(() => {
    if (prevAccountsLength && accounts.length > prevAccountsLength) {
      scrollAreaRef.current?.scrollTo({
        behavior: "smooth",
        top: 0,
        left: scrollAreaRef.current?.scrollWidth,
      });
    }
  }, [prevAccountsLength, accounts.length]);

  // Temporary for adding new account by button click - START
  const importedAccounts = useMaybeAtomValue(allAccountsAtom);

  const rootNeuterExtendedKey = useMaybeAtomValue(
    getNeuterExtendedKeyAtom("m/44'/60'/0'/0")
  );

  const neuterExtendedKey = useMemo(
    () => rootNeuterExtendedKey && fromProtectedString(rootNeuterExtendedKey),
    [rootNeuterExtendedKey]
  );

  const findFirstUnusedAccount = useCallback(
    (key: string, offset = 0, limit = 9) => {
      const newAccounts = generatePreviewHDNodes(key, offset, limit);

      if (!importedAccounts || importedAccounts.length <= 0) {
        return newAccounts[0];
      }

      const filteredAccs = newAccounts.filter(
        ({ address }) =>
          !importedAccounts.some(
            ({ address: imported }) => imported === address
          )
      );

      if (filteredAccs.length <= 0) {
        return null;
      }

      return {
        index: filteredAccs[0].index,
      };
    },
    [importedAccounts]
  );

  const addressToAdd = useMemo(() => {
    if (!neuterExtendedKey) {
      return null;
    }

    let offset = 0;
    let limit = 9;
    let unusedAccount = null;
    while (unusedAccount === null) {
      unusedAccount = findFirstUnusedAccount(neuterExtendedKey, offset, limit);
      offset = limit;
      limit += 9;
    }

    return unusedAccount;
  }, [findFirstUnusedAccount, neuterExtendedKey]);

  const handleAddNewAccount = useCallback(async () => {
    try {
      if (addressToAdd) {
        console.log("addressToAdd", addressToAdd);

        const FAKE_NAMES = [
          "True Believer",
          "Stable Staker",
          "NFT Hodler",
          "Cryptopunk",
          "Game Dominator",
          "The Rest 1",
          "The Rest 2",
          "The Rest 3",
        ];

        await addAccounts([
          {
            source: AccountSource.SeedPhrase,
            name: FAKE_NAMES[addressToAdd.index],
            derivationPath: `m/44'/60'/0'/0/${addressToAdd.index}`,
          },
        ]);
      }
    } catch (err: any) {
      console.error(err.message);
    }
  }, [addressToAdd]);

  // Temporary for adding new account by button click - END

  if (accounts.length === 0) {
    return <EmptyWalletCard onClick={handleAddNewAccount} />;
  }

  return (
    <div className="flex flex-col w-full min-w-0">
      <div className="flex items-center mb-3">
        <SearchInput
          searchValue={searchValue}
          toggleSearchValue={setSearchValue}
        />
        <NewButton
          onClick={handleAddNewAccount}
          theme="tertiary"
          className="ml-5 !py-2"
        >
          <AddWalletIcon className="mr-2" />
          Add Wallet
        </NewButton>
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
            "text-sm text-brand-placeholder"
          )}
        >
          <NoResultsFoundIcon className="mr-5" />
          No results found
        </div>
      )}
    </div>
  );
};
