import { FC, memo } from "react";
import classNames from "clsx";

import {
  Account,
  TxAction as TxActionPrimitive,
  TxActionType,
} from "core/types";
import { getNetworkIconUrl } from "fixtures/networks";

import { useLazyNetwork } from "app/hooks";
import AutoIcon from "app/components/elements/AutoIcon";
import WalletName from "app/components/elements/WalletName";
import HashPreview from "app/components/elements/HashPreview";
import Balance from "app/components/elements/Balance";
import Avatar from "app/components/elements/Avatar";
import { ActivityIcon } from "app/components/blocks/ActivityBar";
import { ReactComponent as SendIcon } from "app/icons/Send.svg";

type TransactionHeaderProps = {
  account: Account;
  action: TxActionPrimitive | null;
};

const TransactionHeader: FC<TransactionHeaderProps> = ({ account, action }) => {
  return (
    <div className="flex">
      <WalletCard account={account} />
      <div className="flex flex-col pl-2 w-1/2">
        <TxAction action={action} className="h-1/2" />
        <NetworkPreview className="mt-1 h-1/2" />
      </div>
    </div>
  );
};

export default TransactionHeader;

const cardClassName = classNames(
  "flex items-center",
  "w-full",
  "py-1 px-3",
  "text-xs font-bold",
  "bg-brand-main/5",
  "rounded-[.625rem]"
);

type TxActionProps = {
  action: TxActionPrimitive | null;
  className?: string;
};

const TxAction: FC<TxActionProps> = ({ action, className }) => {
  if (!action) {
    return null;
  }

  let content;
  switch (action.type) {
    case TxActionType.TokenTransfer:
      content = (
        <>
          <span className="block w-6 h-6 flex items-center justify-center mr-2">
            <ActivityIcon
              Icon={SendIcon}
              className="!w-5 !h-5 glass-icon-hover"
            />
          </span>
          Transfer
        </>
      );
  }

  return <div className={classNames(cardClassName, className)}>{content}</div>;
};

type WalletCardProps = {
  account: Account;
};

const WalletCard: FC<WalletCardProps> = ({ account }) => (
  <div
    className={classNames(
      "relative",
      "p-3",
      "w-1/2",
      "bg-brand-main/5",
      "rounded-[.625rem]",
      "flex items-stretch",
      "text-left"
    )}
  >
    <AutoIcon
      seed={account.address}
      source="dicebear"
      type="personas"
      className={classNames(
        "h-12 w-12 min-w-[3rem]",
        "mr-2",
        "bg-black/20",
        "rounded-[.625rem]"
      )}
    />
    <span className="flex flex-col min-w-0 text-sm leading-none">
      <WalletName wallet={account} theme="small" />
      <HashPreview
        hash={account.address}
        className="text-xs leading-none text-brand-inactivedark"
      />
      <Balance address={account.address} className="font-bold mt-auto" />
    </span>
  </div>
);

const NetworkPreview = memo<{ className?: string }>(({ className }) => {
  const network = useLazyNetwork();

  return (
    <div className={classNames(cardClassName, className)}>
      <Avatar
        src={network && getNetworkIconUrl(network.chainId)}
        alt={network?.name}
        withBorder={false}
        className="w-6 mr-2"
      />

      {network?.name}
    </div>
  );
});
