import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import classNames from "clsx";
import useForceUpdate from "use-force-update";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { assert } from "lib/system/assert";
import { useAtomsAll } from "lib/atom-utils";

import { Account as AccountType, ConnectionApproval } from "core/types";
import { approveItem, TEvent, trackEvent } from "core/client";

import { openInTabStrict } from "app/helpers";
import {
  accountAddressAtom,
  allAccountsAtom,
  chainIdAtom,
  getPermissionAtom,
} from "app/atoms";
import { ChainIdProvider, useAccounts, useSync } from "app/hooks";
import { useDialog } from "app/hooks/dialog";
import { withHumanDelay } from "app/utils";
import Checkbox from "app/components/elements/Checkbox";
import AutoIcon from "app/components/elements/AutoIcon";
import HashPreview from "app/components/elements/HashPreview";
import ScrollAreaContainer from "app/components/elements/ScrollAreaContainer";
import Separator from "app/components/elements/Seperator";
import TooltipIcon from "app/components/elements/TooltipIcon";
import Tooltip from "app/components/elements/Tooltip";
import TotalWalletBalance from "app/components/elements/TotalWalletBalance";
import WalletName from "app/components/elements/WalletName";
import NetworkSelect from "app/components/elements/NetworkSelect";
import Button from "app/components/elements/Button";
import DappLogos from "app/components/elements/approvals/DappLogos";
import { ReactComponent as BalanceIcon } from "app/icons/dapp-balance.svg";
import { ReactComponent as TransactionsIcon } from "app/icons/dapp-transactions.svg";
import { ReactComponent as FundsIcon } from "app/icons/dapp-move-funds.svg";
import { ReactComponent as NoResultsFoundIcon } from "app/icons/no-results-found.svg";
import { ReactComponent as AddWalletIcon } from "app/icons/add-wallet.svg";

import ApprovalLayout from "./Layout";

type ApproveConnectionProps = {
  approval: ConnectionApproval;
};

const ApproveConnection: FC<ApproveConnectionProps> = ({ approval }) => {
  const sourceOrigin = useMemo(() => {
    assert(approval.source.type === "page");
    return new URL(approval.source.url).origin;
  }, [approval]);

  const [internalChainId, currentPermission] = useAtomsAll([
    chainIdAtom,
    getPermissionAtom(sourceOrigin),
    allAccountsAtom,
    accountAddressAtom,
  ]);

  const { currentAccount, allAccounts } = useAccounts();

  const defaultAddresses = useMemo(
    () => [
      ...(currentPermission?.accountAddresses ?? []),
      currentAccount.address,
    ],
    [currentPermission, currentAccount],
  );

  const { alert } = useDialog();

  const accountsToConnectRef = useRef(new Set<string>(defaultAddresses));
  const forceUpdate = useForceUpdate();

  const localChainIdRef = useRef(currentPermission?.chainId ?? internalChainId);

  const localChainId = localChainIdRef.current;
  const setLocalChainId = useCallback(
    (chainId: number) => {
      localChainIdRef.current = chainId;
      forceUpdate();
    },
    [forceUpdate],
  );

  useSync(localChainId, currentAccount.address);

  useEffect(() => {
    if (!currentPermission && internalChainId !== localChainIdRef.current) {
      setLocalChainId(internalChainId);
    }
  }, [currentPermission, internalChainId, setLocalChainId]);

  useEffect(() => {
    accountsToConnectRef.current.add(currentAccount.address);
    forceUpdate();
  }, [currentAccount, forceUpdate]);

  const toggleAccount = useCallback(
    (address: string) => {
      const addressesToAdd = accountsToConnectRef.current;
      if (addressesToAdd.has(address)) {
        addressesToAdd.delete(address);
      } else {
        addressesToAdd.add(address);
      }

      setAllAccountsChecked(addressesToAdd.size === allAccounts.length);

      forceUpdate();
    },
    [allAccounts.length, forceUpdate],
  );

  const [allAccountsChecked, setAllAccountsChecked] = useState(false);

  const toggleAllAccounts = useCallback(
    (remove = false) => {
      const accountsToAdd = accountsToConnectRef.current;
      allAccounts.forEach(({ address }) => {
        if (remove) {
          if (accountsToAdd.has(address)) {
            accountsToAdd.delete(address);
          }
        } else {
          if (!accountsToAdd.has(address)) {
            accountsToAdd.add(address);
          }
        }
      });
      setAllAccountsChecked((prevState) => !prevState);
      forceUpdate();
    },
    [allAccounts, forceUpdate],
  );

  const [approving, setApproving] = useState(false);

  const handleApprove = useCallback(
    async (approved: boolean) => {
      setApproving(true);

      try {
        await withHumanDelay(async () => {
          const accountsToAdd = Array.from(accountsToConnectRef.current);
          if (approved && accountsToAdd.length === 0) {
            throw new Error("You must select at least one account");
          }

          const accountAddresses = approved ? accountsToAdd : undefined;
          await approveItem(approval.id, {
            approved,
            accountAddresses,
            overriddenChainId: localChainIdRef.current,
          });
        });
      } catch (err: any) {
        alert({
          title: "Error",
          content: err?.message ?? "Unknown error occurred",
        });
        setApproving(false);
      }
    },
    [approval, setApproving, alert],
  );

  useEffect(() => {
    trackEvent(TEvent.DappConnect);
  }, []);

  if (approval.source.type !== "page") return null;

  return (
    <ApprovalLayout
      approveText="Connect"
      declineText="Deny"
      className="items-center"
      approving={approving}
      onApprove={handleApprove}
    >
      <ChainIdProvider chainId={localChainId}>
        <DappLogos dappLogoUrl={approval.source.favIconUrl} />
        <h1 className="text-2xl font-bold mt-4 mb-1">Connect to the website</h1>
        <span className="text-base text-center mb-6">
          {new URL(approval.source.url).host}
        </span>
        <div className="w-full flex items-center px-3 pb-1.5">
          <CheckboxPrimitive.Root
            checked={allAccountsChecked}
            onCheckedChange={(checked) => toggleAllAccounts(!checked)}
            className="flex items-center"
          >
            <Checkbox checked={allAccountsChecked} className="mr-2.5" />
            <span className="text-brand-inactivedark2">Select all</span>
          </CheckboxPrimitive.Root>
          <Tooltip
            content={
              <p>
                Use this switch to select a preferred network for the connection
                and to preview the balances of the wallets to select the right
                one.
              </p>
            }
            interactive={false}
            placement="bottom-end"
            size="large"
            className="ml-auto"
          >
            <TooltipIcon />
          </Tooltip>

          <NetworkSelect
            className="ml-2"
            onChange={setLocalChainId}
            changeInternalChainId={false}
            withAction={false}
            size="small"
            source="connection"
            withFiat={false}
          />
        </div>
        <Separator />
        {allAccounts.length === 0 ? (
          <EmptyAccountsToConnect />
        ) : (
          <ScrollAreaContainer
            className="w-full h-full box-content -mr-5 pr-5 grow"
            viewPortClassName="py-2.5 viewportBlock"
          >
            {allAccounts.map((account, i) => (
              <Account
                key={account.address}
                account={account}
                checked={accountsToConnectRef.current.has(account.address)}
                onToggleAdd={() => toggleAccount(account.address)}
                className={i !== allAccounts.length - 1 ? "mb-1" : ""}
              />
            ))}
          </ScrollAreaContainer>
        )}
        <ConnectionWarnings />
      </ChainIdProvider>
    </ApprovalLayout>
  );
};

export default ApproveConnection;

const warnings = [
  {
    Icon: BalanceIcon,
    label: "See wallet balance and activity",
  },
  {
    Icon: TransactionsIcon,
    label: "Send requests for transactions",
  },
  {
    Icon: FundsIcon,
    label: "CANNOT move funds without permission",
  },
];

const ConnectionWarnings: FC = () => (
  <div className="grid grid-cols-3 gap-3 py-3 border-y border-brand-main/[.07] mt-auto">
    {warnings.map(({ label, Icon }) => (
      <div key={label} className="flex flex-col items-center text-center">
        <Icon />
        <h4 className="text-xs text-brand-inactivedark mt-2">{label}</h4>
      </div>
    ))}
  </div>
);

const EmptyAccountsToConnect: FC = () => (
  <div
    className={classNames(
      "flex flex-col items-center justify-center mx-auto",
      "w-full h-full py-4",
      "text-sm text-brand-inactivedark2 text-center",
    )}
  >
    <NoResultsFoundIcon className="mb-4" />
    <div>There no wallets to connect.</div>
    <Button
      theme="secondary"
      onClick={() => openInTabStrict({ addAccOpened: true }, ["token"], true)}
      className="ml-5 !py-1 !text-sm !min-w-[8rem] mt-2.5"
    >
      <AddWalletIcon className="h-5 w-auto mr-1.5" />
      Add wallet
    </Button>
  </div>
);

type AccountProps = {
  account: AccountType;
  checked: boolean;
  onToggleAdd: () => void;
  className?: string;
};

const Account: FC<AccountProps> = ({
  account,
  checked,
  onToggleAdd,
  className,
}) => {
  const { address } = account;

  return (
    <CheckboxPrimitive.Root
      checked={checked}
      onCheckedChange={onToggleAdd}
      autoFocus={checked}
      className={classNames(
        "w-full",
        "flex items-center",
        "min-w-0 px-3 py-1.5",
        "rounded-[.625rem]",
        "transition-colors",
        "hover:bg-brand-main/10 focus-visible:bg-brand-main/10",
        "outline-none",
        className,
      )}
    >
      <Checkbox checked={checked} className="mr-4 min-w-[1.25rem]" />

      <AutoIcon
        seed={address}
        source="dicebear"
        type="personas"
        className={classNames(
          "h-8 w-8 min-w-[2rem]",
          "mr-3",
          "bg-black/20",
          "rounded-[.625rem]",
        )}
      />

      <span className="flex flex-col text-left min-w-0 max-w-[40%] mr-auto">
        <WalletName wallet={account} theme="small" />
        <HashPreview
          hash={address}
          className="text-xs text-brand-inactivedark font-normal mt-[2px]"
          withTooltip={false}
        />
      </span>
      <span className="flex flex-col text-right min-w-0">
        <TotalWalletBalance
          address={address}
          className="text-sm font-bold text-brand-light ml-2"
        />
      </span>
    </CheckboxPrimitive.Root>
  );
};
