import { FC, useMemo, useState } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { waitForAll } from "jotai/utils";
import classNames from "clsx";
import Fuse from "fuse.js";
import { ethers } from "ethers";
import BigNumber from "bignumber.js";
import { TReplace } from "lib/ext/i18n/react";

import { Account } from "core/types";

import { ACCOUNTS_SEARCH_OPTIONS } from "app/defaults";
import {
  accountAddressAtom,
  allAccountsAtom,
  currentAccountAtom,
} from "app/atoms";
import { useToken } from "app/hooks";

import Select from "./Select";
import AutoIcon from "./AutoIcon";
import HashPreview from "./HashPreview";
import Balance from "./Balance";
import CopiableTooltip from "./CopiableTooltip";
import FiatAmount from "./FiatAmount";
import PrettyAmount from "./PrettyAmount";
import { ReactComponent as SuccessIcon } from "app/icons/success.svg";
import { ReactComponent as CopyIcon } from "app/icons/copy.svg";
import { ReactComponent as SelectedIcon } from "app/icons/SelectCheck.svg";
import { ReactComponent as GasIcon } from "app/icons/gas.svg";

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
        .map(({ item: network }) =>
          prepareAccount(network, network.address === currentAccount.address)
        );
    } else {
      return allAccounts.map((network) =>
        prepareAccount(network, network.address === currentAccount.address)
      );
    }
  }, [searchValue, fuse, currentAccount.address, allAccounts]);

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
      showSelected
      showSelectedIcon={false}
      currentItemClassName={classNames("!py-2 pl-2 pr-3", className)}
      contentClassName="!w-[22.25rem]"
    />
  );
};

export default AccountSelect;

type AccountSelectItemProps = {
  account: Account;
};

const CurrentAccount: FC<AccountSelectItemProps> = ({ account }) => {
  const [copied, setCopied] = useState(false);
  const nativeToken = useToken(account.address);
  const portfolioBalance = nativeToken?.portfolioUSD;

  return (
    <span className="flex items-center text-left w-full pr-3 min-w-0">
      <AutoIcon
        seed={account.address}
        source="dicebear"
        type="personas"
        className={classNames(
          "h-10 w-10 min-w-[2.5rem]",
          "mr-1",
          "bg-black/20",
          "rounded-[.625rem]"
        )}
      />
      <CopiableTooltip
        content="Copy wallet address to clipboard"
        textToCopy={account.address}
        onCopiedToggle={setCopied}
        className={classNames(
          "px-1 -my-1 mr-4",
          "text-left",
          "rounded",
          "min-w-0",
          "max-w-full",
          "inline-flex flex-col",
          "transition-colors",
          "hover:bg-brand-main/40 focus-visible:bg-brand-main/40"
        )}
      >
        <>
          <span className="font-bold truncate w-full">
            <TReplace msg={account.name} />
          </span>
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
        </>
      </CopiableTooltip>
      <span className="flex flex-col items-end ml-auto">
        <span className="inline-flex min-h-[1.25rem] mt-auto">
          {portfolioBalance ? (
            <FiatAmount
              amount={nativeToken ? portfolioBalance : null}
              isMinified={new BigNumber(portfolioBalance).isLessThan(0.01)}
              copiable
              className="font-bold"
            />
          ) : (
            <PrettyAmount
              amount={
                nativeToken
                  ? ethers.utils.formatEther(nativeToken.rawBalance)
                  : null
              }
              currency={nativeToken?.symbol}
              isMinified={false}
              copiable
              className="font-bold"
            />
          )}
        </span>
        {portfolioBalance && (
          <PrettyAmount
            amount={
              nativeToken
                ? ethers.utils.formatEther(nativeToken.rawBalance)
                : null
            }
            currency={nativeToken?.symbol}
            isMinified
            copiable
            prefix={<GasIcon className="w-2.5 h-2.5 mr-1" />}
            className="text-xs leading-4 text-brand-inactivedark font-normal flex items-center mt-px"
          />
        )}
      </span>
    </span>
  );
};

const AccountSelectItem: FC<
  AccountSelectItemProps & { isSelected?: boolean }
> = ({ account, isSelected = false }) => (
  <span className="flex items-center text-left w-full min-w-0">
    <span
      className={classNames(
        "relative",
        "h-8 w-8 min-w-[2rem]",
        "mr-3",
        "bg-black/20",
        "rounded-[.625rem]"
      )}
    >
      <AutoIcon
        seed={account.address}
        source="dicebear"
        type="personas"
        className={classNames("w-full h-full", isSelected && "opacity-20")}
      />
      {isSelected && (
        <span
          className={classNames(
            "absolute inset-0",
            "rounded-[.625rem]",
            "border border-brand-light",
            "flex items-center justify-center"
          )}
        >
          <SelectedIcon className="fill-brand-light" />
        </span>
      )}
    </span>
    <span className="flex flex-col min-w-0 max-w-[45%]">
      <span className="truncate">
        <TReplace msg={account.name} />
      </span>
      <HashPreview
        hash={account.address}
        className="text-xs text-brand-inactivedark font-normal mt-px"
        withTooltip={false}
      />
    </span>
    <Balance
      address={account.address}
      className="text-sm text-brand-light ml-auto"
    />
  </span>
);

const prepareCurrentAccount = (account: Account) => ({
  key: account.address,
  value: <CurrentAccount account={account} />,
});

const prepareAccount = (account: Account, isSelected = false) => ({
  key: account.address,
  value: <AccountSelectItem account={account} isSelected={isSelected} />,
});
