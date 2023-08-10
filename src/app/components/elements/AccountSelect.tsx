import { FC, useMemo, useState } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import classNames from "clsx";
import Fuse from "fuse.js";

import { Account } from "core/types";

import { ACCOUNTS_SEARCH_OPTIONS } from "app/defaults";
import {
  accountAddressAtom,
  activeTabAtom,
  activeTabOriginAtom,
  getPermissionAtom,
} from "app/atoms";
import { useAccounts, useToken } from "app/hooks";
import { Page } from "app/nav";
import { ReactComponent as SuccessIcon } from "app/icons/success.svg";
import { ReactComponent as CopyIcon } from "app/icons/copy.svg";
import { ReactComponent as SelectedIcon } from "app/icons/SelectCheck.svg";
import { ReactComponent as GasIcon } from "app/icons/gas.svg";
import { ReactComponent as AddWalletIcon } from "app/icons/add-wallet.svg";

import Select from "./Select";
import AutoIcon from "./AutoIcon";
import HashPreview from "./HashPreview";
import Balance from "./Balance";
import CopiableTooltip from "./CopiableTooltip";
import WalletName from "./WalletName";
import SmartLink from "./SmartLink";
import Avatar from "./Avatar";
import IconedButton from "./IconedButton";

type AccountSelectProps = {
  className?: string;
};

const AccountSelect: FC<AccountSelectProps> = ({ className }) => {
  const { currentAccount, allAccounts } = useAccounts();
  const setAccountAddress = useSetAtom(accountAddressAtom);
  const activeTab = useAtomValue(activeTabAtom);
  const tabOrigin = useAtomValue(activeTabOriginAtom);
  const purePermission = useAtomValue(getPermissionAtom(tabOrigin));

  const [opened, setOpened] = useState(false);
  const [searchValue, setSearchValue] = useState<string | null>(null);

  const connectedAccountAddresses = useMemo(
    () =>
      purePermission && purePermission.accountAddresses.length > 0
        ? purePermission.accountAddresses
        : [],
    [purePermission],
  );

  const fuse = useMemo(
    () => new Fuse(allAccounts, ACCOUNTS_SEARCH_OPTIONS),
    [allAccounts],
  );

  const preparedAccounts = useMemo(() => {
    if (searchValue) {
      return fuse.search(searchValue).map(({ item: acc }) => {
        const isConnected = connectedAccountAddresses.includes(acc.address);
        return prepareAccount(acc, acc.address === currentAccount.address, {
          isConnected,
          icon: activeTab?.favIconUrl,
          origin: purePermission?.origin,
        });
      });
    } else {
      return allAccounts.map((acc) => {
        const isConnected = connectedAccountAddresses.includes(acc.address);
        return prepareAccount(acc, acc.address === currentAccount.address, {
          isConnected,
          icon: activeTab?.favIconUrl,
          origin: purePermission?.origin,
        });
      });
    }
  }, [
    searchValue,
    fuse,
    connectedAccountAddresses,
    currentAccount.address,
    activeTab,
    purePermission,
    allAccounts,
  ]);

  const preparedCurrentAccount = useMemo(
    () => prepareCurrentAccount(currentAccount),
    [currentAccount],
  );

  return (
    <Select
      open={opened}
      onOpenChange={setOpened}
      items={preparedAccounts}
      currentItem={preparedCurrentAccount}
      setItem={(account) => setAccountAddress(account.key)}
      searchValue={searchValue}
      onSearch={setSearchValue}
      showSelected
      showSelectedIcon={false}
      currentItemClassName={classNames("!py-2 !pl-2 pr-3", className)}
      contentClassName="!w-[22.25rem]"
      itemClassName="group"
      actions={
        <IconedButton
          to={{ addAccOpened: true }}
          merge
          smartLink
          theme="tertiary"
          className="ml-2"
          Icon={AddWalletIcon}
          aria-label="Add new wallet"
        />
      }
      emptySearchText={
        <>
          You can manage your wallets in the{" "}
          <SmartLink
            to={{ page: Page.Wallets }}
            onClick={() => setOpened(false)}
            className="underline underline-offset-2"
          >
            Wallets
          </SmartLink>{" "}
          tab.
        </>
      }
    />
  );
};

export default AccountSelect;

type AccountSelectItemProps = {
  account: Account;
};

const CurrentAccount: FC<AccountSelectItemProps> = ({ account }) => {
  const { address } = account;
  const [copied, setCopied] = useState(false);
  const portfolioBalance = useToken(address)?.portfolioUSD;

  return (
    <span className="flex items-center text-left w-full pr-3 min-w-0">
      <AutoIcon
        seed={address}
        source="dicebear"
        type="personas"
        className={classNames(
          "h-10 w-10 min-w-[2.5rem]",
          "mr-1",
          "bg-black/20",
          "rounded-[.625rem]",
        )}
      />
      <CopiableTooltip
        content="Copy wallet address to clipboard"
        textToCopy={address}
        onCopiedToggle={setCopied}
        asSpan
        className={classNames(
          "px-1 -my-1 mr-4",
          "text-left",
          "rounded",
          "min-w-0",
          "max-w-full",
          "inline-flex flex-col",
          "transition-colors",
          "hover:bg-brand-main/40 focus-visible:bg-brand-main/40",
        )}
      >
        <>
          <WalletName wallet={account} theme="small" />
          <span className="flex items-center mt-auto">
            <HashPreview
              hash={address}
              className="text-xs text-brand-light font-normal leading-4 mr-1"
              withTooltip={false}
            />
            {copied ? (
              <SuccessIcon className="w-[1.125rem] min-w-[1.125rem] h-auto" />
            ) : (
              <CopyIcon className="w-[1.125rem] min-w-[1.125rem] h-auto" />
            )}
          </span>
        </>
      </CopiableTooltip>
      <span className="flex flex-col items-end ml-auto">
        <span className="inline-flex min-h-[1.25rem] mt-auto">
          <Balance address={address} copiable asSpan className="font-bold" />
        </span>
        {portfolioBalance && (
          <Balance
            address={address}
            isNative
            isMinified
            copiable
            asSpan
            prefix={<GasIcon className="w-2.5 h-2.5 mr-1" />}
            className="text-xs leading-4 text-brand-inactivedark font-normal flex items-center mt-px"
          />
        )}
      </span>
    </span>
  );
};

type DappObj = {
  isConnected: boolean;
  icon?: string;
  origin?: string;
};

const AccountSelectItem: FC<
  AccountSelectItemProps & { isSelected?: boolean; dapp?: DappObj }
> = ({ account, isSelected = false, dapp }) => (
  <span className="flex items-center text-left w-full min-w-0">
    <span
      className={classNames(
        "relative",
        "h-8 w-8 min-w-[2rem]",
        "mr-3",
        "bg-black/20",
        "rounded-[.625rem]",
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
            "absolute",
            dapp?.isConnected ? "inset-px" : "inset-0",
            "rounded-[.625rem]",
            "border border-brand-light",
            "flex items-center justify-center",
          )}
        >
          <SelectedIcon className="fill-brand-light" />
        </span>
      )}
      {dapp && dapp.isConnected && (
        <span
          className={classNames(
            "absolute",
            "inset-0",
            "rounded-[calc(.625rem+1px)]",
            "border border-brand-greenobject",
          )}
        >
          <span
            className={classNames(
              "absolute",
              "-top-1.5 -right-1.5",
              "block",
              "w-4 h-4",
              "rounded-full overflow-hidden",
              "border border-brand-greenobject",
            )}
          >
            <Avatar
              src={dapp.icon}
              alt={dapp.origin}
              className={classNames(
                "w-full h-full object-cover",
                "!border-none",
              )}
            />
          </span>
        </span>
      )}
    </span>
    <span className="flex flex-col min-w-0 max-w-[45%]">
      <WalletName wallet={account} theme="small" />
      <HashPreview
        hash={account.address}
        className={classNames(
          "text-xs text-brand-inactivedark font-normal",
          "mt-px",
          "transition-colors",
          "group-hover:text-brand-light",
        )}
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

const prepareAccount = (
  account: Account,
  isSelected = false,
  dapp: DappObj,
) => ({
  key: account.address,
  value: (
    <AccountSelectItem account={account} isSelected={isSelected} dapp={dapp} />
  ),
});
