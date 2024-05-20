import { FC, memo, useCallback } from "react";
import classNames from "clsx";

import { Account, ActivitySource, SelfActivityKind } from "core/types";

import { useLazyNetwork } from "app/hooks";
import { openInTabExternal } from "app/utils";
import { ActivityIcon } from "app/components/blocks/ApprovalStatus";
import WalletName from "app/components/elements/WalletName";
import HashPreview from "app/components/elements/HashPreview";
import TotalWalletBalance from "app/components/elements/TotalWalletBalance";
import Avatar from "app/components/elements/Avatar";
import { ReactComponent as SendIcon } from "app/icons/Send.svg";
import { ReactComponent as RewardsIcon } from "app/icons/Rewards.svg";
import { ReactComponent as LinkIcon } from "app/icons/external-link.svg";
import { ReactComponent as SigningIcon } from "app/icons/edit-medium.svg";
import { ReactComponent as SwapIcon } from "app/icons/SwapIcon.svg";
import WalletAvatar from "app/components/elements/WalletAvatar";
import NetworkIcon from "app/components/elements/NetworkIcon";

type ApprovalHeaderProps = {
  account: Account;
  source: ActivitySource;
  signing?: boolean;
  className?: string;
};

const ApprovalHeader: FC<ApprovalHeaderProps> = ({
  account,
  source,
  signing,
  className,
}) => {
  return (
    <div className={classNames("flex", className)}>
      <WalletCard account={account} signing={signing} />

      <div className="flex flex-col pl-2 w-1/2">
        <ActSource source={source} className="h-1/2 mb-1" />

        {signing ? (
          <SigningPreview className="h-1/2" />
        ) : (
          <NetworkPreview className="h-1/2" />
        )}
      </div>
    </div>
  );
};

export default ApprovalHeader;

const cardClassName = classNames(
  "flex items-center",
  "w-full",
  "py-1 px-3",
  "text-xs font-bold",
  "bg-brand-main/5",
  "rounded-[.625rem]",
);

type ActSourceProps = {
  source: ActivitySource;
  className?: string;
};

const ActSource: FC<ActSourceProps> = ({ source, className }) => {
  const handleLinkClick = useCallback(() => {
    if (source.type === "page") {
      openInTabExternal(source.url, source.tabId);
    }
  }, [source]);

  if (source.type === "self") {
    return (
      <div className={classNames(cardClassName, className)}>
        <span className="w-6 h-6 min-w-[1.5rem] flex items-center justify-center mr-2">
          <ActivityIcon
            Icon={
              source.swapMeta
                ? SwapIcon
                : source.kind === SelfActivityKind.Reward
                  ? RewardsIcon
                  : SendIcon
            }
            className="!w-5 !h-5 styled-icon--active"
          />
        </span>
        {source.swapMeta
          ? "Swap"
          : source.kind === SelfActivityKind.Reward
            ? "Rewards"
            : "Transfer"}
      </div>
    );
  }

  return (
    <button
      onClick={handleLinkClick}
      className={classNames(
        cardClassName,
        "cursor-pointer",
        "transition-colors",
        "hover:bg-brand-main/10 focus-visible:bg-brand-main/10",
        className,
      )}
    >
      <Avatar
        src={source.favIconUrl}
        alt={source.url}
        className={classNames(
          "w-6 min-w-[1.5rem] h-6 mr-2 object-cover",
          "!border-none",
        )}
        fallbackClassName="!h-3/5"
      />
      <span className="min-w-0 truncate">{new URL(source.url).host}</span>
      <LinkIcon className="ml-1 w-4 h-4 min-w-[1rem]" />
    </button>
  );
};

type WalletCardProps = {
  account: Account;
  signing?: boolean;
};

const WalletCard: FC<WalletCardProps> = ({ account, signing }) => (
  <div
    className={classNames(
      "relative",
      "p-3",
      "w-1/2",
      "bg-brand-main/5",
      "rounded-[.625rem]",
      "flex items-stretch",
      "text-left",
    )}
  >
    <WalletAvatar
      seed={account.address}
      className={classNames(
        "h-12 w-12 min-w-[3rem]",
        "mr-2",
        "bg-black/20",
        "rounded-[.625rem]",
      )}
    />
    <span
      className={classNames(
        "flex flex-col items-start min-w-0 text-sm leading-none",
        signing && "justify-center",
      )}
    >
      <WalletName
        wallet={account}
        theme="small"
        className={classNames(signing && "mb-1")}
      />
      <HashPreview
        hash={account.address}
        className="text-xs leading-none text-brand-inactivedark"
      />
      {!signing && (
        <TotalWalletBalance
          address={account.address}
          isMinified
          copiable
          className="font-bold mt-auto"
        />
      )}
    </span>
  </div>
);

const NetworkPreview = memo<{ className?: string }>(({ className }) => {
  const network = useLazyNetwork();

  return (
    <div className={classNames(cardClassName, className)}>
      {network && (
        <NetworkIcon network={network} className="w-6 mr-2 min-w-[1.5rem]" />
      )}

      <span className="truncate min-w-0">{network?.name}</span>
    </div>
  );
});

const SigningPreview = memo<{ className?: string }>(({ className }) => (
  <div className={classNames(cardClassName, className)}>
    <SigningIcon className="h-6 w-6 mr-2 min-w-[1.5rem]" />
    Signing
  </div>
));
