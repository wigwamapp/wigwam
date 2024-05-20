import { FC, memo, forwardRef, useCallback, useRef } from "react";
import BigNumber from "bignumber.js";
import classNames from "clsx";
import { useCopyToClipboard } from "lib/react-hooks/useCopyToClipboard";

import {
  AccountToken,
  TokenActivity as TokenActivityPrimitive,
  TokenActivityProject,
  TokenType,
} from "core/types";
import { createTokenActivityKey } from "core/common/tokens";

import { LOAD_MORE_ON_ACTIVITY_FROM_END } from "app/defaults";
import {
  useChainId,
  useExplorerLink,
  useLazyNetwork,
  useTokenActivity,
  useIsTokenActivitySyncing,
  useAccounts,
} from "app/hooks";
import { LARGE_AMOUNT } from "app/utils/largeAmount";
import PrettyAmount from "app/components/elements/PrettyAmount";
import SmallContactCard from "app/components/elements/SmallContactCard";
import IconedButton from "app/components/elements/IconedButton";
import PrettyDate from "app/components/elements/PrettyDate";
import Avatar from "app/components/elements/Avatar";
import { ReactComponent as SuccessIcon } from "app/icons/success.svg";
import { ReactComponent as CopyIcon } from "app/icons/copy.svg";
import { ReactComponent as WalletExplorerIcon } from "app/icons/external-link.svg";
import { ReactComponent as ActivityApproveIcon } from "app/icons/activity-approve.svg";
import { ReactComponent as ActivityReceiveIcon } from "app/icons/activity-receive.svg";
import { ReactComponent as ActivitySendIcon } from "app/icons/activity-send.svg";

const TokenActivity = memo<{ token: AccountToken }>(({ token }) => {
  const chainId = useChainId();
  const { currentAccount } = useAccounts();
  const { activity, loadMore, hasMore } = useTokenActivity(
    currentAccount.address,
    token.tokenSlug,
  );

  const isSyncing = useIsTokenActivitySyncing(
    chainId,
    currentAccount.address,
    token.tokenSlug,
  );

  const observer = useRef<IntersectionObserver>();
  const loadMoreTriggerRef = useCallback(
    (node: HTMLDivElement) => {
      if (!activity) return;

      if (observer.current) {
        observer.current.disconnect();
      }
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore();
        }
      });

      if (node) {
        observer.current.observe(node);
      }
    },
    [activity, hasMore, loadMore],
  );

  if (activity.length === 0 && !isSyncing) return null;

  return (
    <div
      className={classNames(
        "relative mt-5 pt-1",
        "border-t border-brand-main/[.07]",
        isSyncing && "!border-transparent",
        "flex flex-col",
      )}
    >
      {activity.map((activ, i) => (
        <TokenActivityCard
          ref={
            i === activity.length - LOAD_MORE_ON_ACTIVITY_FROM_END - 1
              ? loadMoreTriggerRef
              : null
          }
          key={createTokenActivityKey(activ)}
          token={token}
          activity={activ}
        />
      ))}

      {isSyncing && (
        <div
          className={classNames(
            "absolute top-[-1px] left-0 right-0",
            "h-px bg-brand-main/[.07]",
            "overflow-hidden",
          )}
        >
          <div
            className={classNames(
              "w-1/3 h-full",
              "bg-gradient-to-r from-brand-main/[.0] via-brand-main/[.3] to-brand-main/[0]",
              "absolute top-0 left-0",
              "-translate-x-full",
              "animate-stripeloading",
            )}
          />
        </div>
      )}
    </div>
  );
});

export default TokenActivity;

type TokenActivityCardProps = {
  token: AccountToken;
  activity: TokenActivityPrimitive;
  className?: string;
};

const TokenActivityCard = forwardRef<HTMLDivElement, TokenActivityCardProps>(
  ({ token, activity, className }, ref) => {
    const currentNetwork = useLazyNetwork();
    const explorerLink = useExplorerLink(currentNetwork);
    const { copy, copied } = useCopyToClipboard(activity.txHash);

    const amoutnBN = new BigNumber(activity.amount ?? 0);
    const { Icon, prefix, amountClassName, label, anotherAddressLabel } =
      getActivityInfo(activity);

    const tokenSymbol =
      token.tokenType === TokenType.Asset ? token.symbol : undefined;
    const tokenDecimals =
      token.tokenType === TokenType.Asset ? token.decimals : 0;

    if (amoutnBN.isZero()) return null;

    return (
      <div
        ref={ref}
        className={classNames(
          "flex items-center",
          "h-[4.875rem]",
          "py-4",
          "border-brand-main/[.07]",
          className,
        )}
      >
        <div className="flex items-center w-[47%]">
          <div
            className={classNames(
              "flex items-center justify-center",
              "w-9 h-9 min-w-[2.25rem]",
              "bg-brand-main/5",
              "rounded-full",
              "mr-3",
            )}
          >
            <Icon className="w-5 h-5 opacity-75" />
          </div>
          <div className="flex flex-col items-start">
            {amoutnBN.gte(LARGE_AMOUNT) ? (
              <span
                className={classNames("text-base font-bold", amountClassName)}
              >
                ∞ {tokenSymbol}
              </span>
            ) : (
              <PrettyAmount
                amount={amoutnBN.abs()}
                decimals={tokenDecimals}
                currency={tokenSymbol}
                prefix={prefix}
                isMinified={
                  token.tokenType === TokenType.Asset &&
                  new BigNumber(10).pow(tokenDecimals ?? 18).lte(amoutnBN.abs())
                }
                isThousandsMinified={false}
                copiable={!(tokenDecimals === 0 && amoutnBN.eq(1))}
                className={classNames("text-base font-bold", amountClassName)}
              />
            )}

            <div className="mt-1 text-xs font-medium text-brand-inactivedark">
              {label}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-start text-sm">
          <SmallContactCard
            address={activity.anotherAddress}
            extended
            isSmall
            addButton={activity.type !== "approve" && !activity.project}
            className="min-h-[1.5rem] text-brand-lightgray !-my-0"
          />

          <div className="mt-1 text-xs font-medium capitalize text-brand-inactivedark">
            {activity.project ? (
              <ProjectLabel project={activity.project} />
            ) : (
              <span>{anotherAddressLabel}</span>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end ml-auto">
          <div className="flex items-center">
            <IconedButton
              aria-label={copied ? "Copied" : "Copy transaction hash"}
              Icon={copied ? SuccessIcon : CopyIcon}
              className="!w-6 !h-6 min-w-[1.5rem]"
              iconClassName="!w-[1.125rem]"
              onClick={() => copy()}
            />
            {explorerLink && (
              <IconedButton
                aria-label="View the transaction in Explorer"
                Icon={WalletExplorerIcon}
                className="!w-6 !h-6 min-w-[1.5rem] ml-2"
                iconClassName="!w-[1.125rem]"
                href={explorerLink.tx(activity.txHash)}
              />
            )}
          </div>
          <div
            className={classNames("text-xs mt-1", "text-brand-inactivedark")}
          >
            {activity.pending ? (
              "Pending"
            ) : (
              <PrettyDate date={activity.timeAt} />
            )}
          </div>
        </div>
      </div>
    );
  },
);

type ProjectLabelProps = {
  project: TokenActivityProject;
  className?: string;
};

const ProjectLabel: FC<ProjectLabelProps> = ({ project, className }) => {
  const children = (
    <>
      {project.logoUrl && (
        <Avatar src={project.logoUrl} className="h-3 w-3 mr-1" />
      )}

      {project.name}
    </>
  );

  return project.siteUrl ? (
    <a
      href={project.siteUrl}
      target="_blank"
      rel="nofollow noreferrer"
      className={classNames("flex items-center hover:underline", className)}
    >
      {children}
    </a>
  ) : (
    <span className={classNames("flex items-center", className)}>
      {children}
    </span>
  );
};

const getActivityInfo = (activity: TokenActivityPrimitive) => {
  const pendingClassName = activity.pending ? "text-[#D99E2E]" : undefined;

  if (activity.type === "approve") {
    return {
      Icon: ActivityApproveIcon,
      prefix: null,
      amountClassName: pendingClassName ?? classNames("text-brand-main"),
      label: "Approve",
      anotherAddressLabel: "Operator",
    };
  }

  if (new BigNumber(activity.amount).gte(0)) {
    return {
      Icon: ActivityReceiveIcon,
      prefix: "+",
      amountClassName: classNames("text-[#6BB77A]"),
      label: activity.project ? "Interaction" : "Receive",
      anotherAddressLabel: "Sender",
    };
  }

  return {
    Icon: ActivitySendIcon,
    prefix: "-",
    amountClassName: classNames(pendingClassName),
    label: activity.project ? "Interaction" : "Transfer",
    anotherAddressLabel: "Recipient",
  };
};
