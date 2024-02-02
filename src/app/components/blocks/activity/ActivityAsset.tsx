import {
  FC,
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import classNames from "clsx";
import { useAtomValue } from "jotai";
import { loadable } from "jotai/utils";
import BigNumber from "bignumber.js";
import { ethers, Transaction } from "ethers";
import { useLazyAtomValue } from "lib/atom-utils";
import { useCopyToClipboard } from "lib/react-hooks/useCopyToClipboard";
import { useSafeState } from "lib/react-hooks/useSafeState";
import { isPopup } from "lib/ext/view";

import { getNetworkIconUrl } from "fixtures/networks";
import {
  Activity,
  ActivitySource,
  ActivityType,
  ConnectionActivity,
  RampActivity,
  TransactionActivity,
  TxAction,
  TxActionType,
} from "core/types";
import { getPageOrigin } from "core/common/permissions";
import * as repo from "core/repo";

import { getNetworkAtom, getPermissionAtom } from "app/atoms";
import { TRANSAK_SUPPORT_URL } from "app/defaults";
import { ChainIdProvider, useExplorerLink, useLazyNetwork } from "app/hooks";
import { openInTabExternal } from "app/utils";
import { useDialog } from "app/hooks/dialog";
import { ReactComponent as SendIcon } from "app/icons/Send.svg";
import { ReactComponent as ChatIcon } from "app/icons/communication.svg";
import {
  ReactComponent as LinkIcon,
  ReactComponent as WalletExplorerIcon,
} from "app/icons/external-link.svg";
import { ReactComponent as SuccessIcon } from "app/icons/success.svg";
import { ReactComponent as CopyIcon } from "app/icons/copy.svg";
import { ReactComponent as ActivityConnectionIcon } from "app/icons/activity-connection.svg";
import { ReactComponent as ActivitySigningIcon } from "app/icons/activity-signing.svg";
import { ReactComponent as ActivityTransactionIcon } from "app/icons/activity-transaction.svg";
import { ReactComponent as ActivityOnRampIcon } from "app/icons/activity-onramp.svg";
import { ReactComponent as GasIcon } from "app/icons/gas.svg";

import Button from "../../elements/Button";
import Avatar from "../../elements/Avatar";
import PrettyDate from "../../elements/PrettyDate";
import IconedButton from "../../elements/IconedButton";
import PrettyAmount from "../../elements/PrettyAmount";
import FiatAmount from "../../elements/FiatAmount";
import Dot from "../../elements/Dot";
import TokenAmount from "../../blocks/TokenAmount";

type StatusType =
  | "succeeded"
  | "failed"
  | "skipped"
  | "revoked"
  | "completed"
  | "cancelled"
  | "failed"
  | "refunded"
  | "expired";

type ActivityCardProps = {
  item: Activity;
  className?: string;
};

const ActivityAsset = memo(
  forwardRef<HTMLDivElement, ActivityCardProps>(({ item, className }, ref) => {
    const isPopupMode = isPopup();
    const [revokedPermission, setRevokedPermission] = useSafeState(false);

    const status = useMemo<StatusType | undefined>(() => {
      if (item.type === ActivityType.Connection && revokedPermission) {
        return "revoked";
      }

      if (item.type === ActivityType.Ramp && !item.pending) {
        const rampStatus = item.status.toLowerCase() as StatusType;
        return rampStatus === "completed" ? "succeeded" : rampStatus;
      }

      if (item.type !== ActivityType.Transaction || item.pending) {
        return;
      }

      if (!item.result) {
        return "skipped";
      }

      if (item.result.status && BigInt(item.result.status) === 0n) {
        return "failed";
      }

      return "succeeded";
    }, [item, revokedPermission]);

    const fee = useMemo(() => {
      if (
        item.type !== ActivityType.Transaction ||
        item.pending ||
        !item.result?.gasUsed
      ) {
        return undefined;
      }

      const parsedTx = Transaction.from(item.rawTx);

      const native = new BigNumber(item.result.gasUsed)
        .times(
          item.result.effectiveGasPrice ??
            parsedTx.maxFeePerGas ??
            parsedTx.gasPrice,
        )
        .toString();

      return {
        native,
        fiat:
          item.gasTokenPriceUSD &&
          new BigNumber(ethers.formatEther(native)).times(
            item.gasTokenPriceUSD,
          ),
      };
    }, [item]);

    return (
      <div
        ref={ref}
        className={classNames(
          "w-full",
          "bg-[#22262A]",
          "border",
          item.pending && "border-[#D99E2E]/50",
          item.pending && "animate-pulse",
          (!status || status === "succeeded" || status === "revoked") &&
            !item.pending &&
            "border-brand-inactivedark/25",
          status === "failed" && "border-brand-redobject/50",
          status === "skipped" && "border-brand-main/50",
          isPopupMode ? "rounded-[.875rem]" : "rounded-2xl",
          "flex items-center",
          isPopupMode ? "py-2 px-3" : "py-3 px-5",
          className,
        )}
      >
        {isPopupMode ? (
          <div className="flex flex-col grow min-w-0">
            <div className="flex items-center">
              <ActivityIcon item={item} className="mr-2" />
              <div className="flex flex-col grow min-w-0">
                <div className="flex items-center justify-between">
                  <ActivityTypeLabel item={item} className="mr-4" />

                  {(item.type === ActivityType.Transaction ||
                    item.type === ActivityType.Ramp) && (
                    <ChainIdProvider chainId={item.chainId}>
                      <ActivityTxActions item={item} />
                    </ChainIdProvider>
                  )}

                  {item.type !== ActivityType.Transaction &&
                    item.source &&
                    item.source?.type === "page" && (
                      <ActivityWebsiteLink source={item.source} />
                    )}
                </div>
                <div className="flex items-center justify-between mt-1 min-h-[1.25rem]">
                  <ActivityTypeStatus status={status} className="mr-4" />

                  {item.type === ActivityType.Connection && (
                    <DisconnectDApp
                      item={item}
                      className="mr-2"
                      setRevokedPermission={setRevokedPermission}
                    />
                  )}

                  <div className="text-xs text-brand-inactivedark ml-auto">
                    <PrettyDate date={item.timeAt} />
                  </div>
                </div>
              </div>
            </div>
            {item.type === ActivityType.Transaction && (
              <div className="flex flex-col mt-2 pt-2 border-t border-brand-main/[.07] ">
                <div className="flex items-center justify-between min-w-0">
                  <ChainIdProvider chainId={item.chainId}>
                    <ActivityTokens
                      source={item.source}
                      action={item.txAction}
                      accountAddress={item.accountAddress}
                    />
                  </ChainIdProvider>
                </div>

                <ActivityNetworkCard
                  chainId={item.chainId}
                  fee={fee}
                  className="mt-1.5 min-w-0"
                />
              </div>
            )}
            {item.type === ActivityType.Ramp && (
              <div className="flex flex-col mt-2 pt-2 border-t border-brand-main/[.07] ">
                <div className="flex items-center justify-between min-w-0">
                  <ChainIdProvider chainId={item.chainId}>
                    <ActivityTokens
                      source={item.source}
                      accountAddress={item.accountAddress}
                    />
                  </ChainIdProvider>

                  <RampDetailsBlock item={item} isPopupMode />
                </div>

                <ActivityNetworkCard
                  chainId={item.chainId}
                  className="mt-1.5 min-w-0"
                />
              </div>
            )}
          </div>
        ) : (
          <>
            <ActivityIcon item={item} className="mr-6" />

            {status ? (
              <div className={classNames("flex flex-col", "w-[9rem] mr-8")}>
                <ActivityTypeLabel item={item} />
                <ActivityTypeStatus status={status} className="mt-0.5 ml-7" />
              </div>
            ) : (
              <ActivityTypeLabel item={item} className="w-[9rem] mr-8" />
            )}

            {item.type === ActivityType.Transaction && (
              <ActivityNetworkCard
                chainId={item.chainId}
                fee={fee}
                className="w-[12rem] mr-8"
              />
            )}

            {item.type === ActivityType.Ramp && (
              <ActivityNetworkCard
                chainId={item.chainId}
                className="w-[9rem] mr-8"
              />
            )}

            {item.type !== ActivityType.Ramp && item.source.type === "page" && (
              <ActivityWebsiteLink
                source={item.source}
                className="w-[9rem] mr-8"
              />
            )}

            {item.type !== ActivityType.Ramp &&
              item.type === ActivityType.Connection && (
                <DisconnectDApp
                  item={item}
                  className="w-[10rem] mr-8"
                  setRevokedPermission={setRevokedPermission}
                />
              )}

            {item.type === ActivityType.Transaction && (
              <ChainIdProvider chainId={item.chainId}>
                <ActivityTokens
                  source={item.source}
                  action={item.txAction}
                  accountAddress={item.accountAddress}
                  className="w-[9rem] mr-8"
                />
              </ChainIdProvider>
            )}

            {item.type === ActivityType.Ramp && (
              <RampDetailsBlock item={item} />
            )}

            <div className="flex flex-col items-end ml-auto">
              {(item.type === ActivityType.Transaction ||
                item.type === ActivityType.Ramp) && (
                <ChainIdProvider chainId={item.chainId}>
                  <ActivityTxActions item={item} className="mb-1" />
                </ChainIdProvider>
              )}

              <div className="text-xs text-brand-inactivedark">
                <PrettyDate date={item.timeAt} />
              </div>
            </div>
          </>
        )}
      </div>
    );
  }),
);

type DisconnectDAppProps = {
  item: ConnectionActivity;
  setRevokedPermission: (r: true) => void;
  className?: string;
};

const DisconnectDApp = memo<DisconnectDAppProps>(
  ({ item, className, setRevokedPermission }) => {
    const isPopupMode = isPopup();
    const origin = useMemo(() => getPageOrigin(item.source), [item.source]);
    const lazyPermission = useAtomValue(loadable(getPermissionAtom(origin)));
    const permission =
      lazyPermission.state === "hasData" ? lazyPermission.data : undefined;

    useEffect(() => {
      if (
        lazyPermission.state === "hasData" &&
        (!lazyPermission.data ||
          lazyPermission.data.accountAddresses.length === 0)
      ) {
        setTimeout(() => setRevokedPermission(true), 0);
      }
    }, [lazyPermission, setRevokedPermission]);

    const handleDisconnect = useCallback(async () => {
      if (!permission) return;

      try {
        await repo.permissions.delete(permission.origin);
      } catch (err) {
        console.error(err);
      }
    }, [permission]);

    if (!permission) return null;
    if (permission.accountAddresses.length === 0) return null;

    return (
      <div className={classNames("flex items-center", className)}>
        <button
          type="button"
          className={classNames(
            "border border-brand-main/20",
            "rounded-md",
            "px-2",
            isPopupMode ? "text-[.625rem] h-5" : "text-xs py-0.5",
            "text-brand-inactivelight",
            "transition-colors",
            "hover:bg-brand-main/10",
          )}
          onClick={handleDisconnect}
        >
          Revoke permission
        </button>
      </div>
    );
  },
);

type ActivityIconProps = {
  item: Activity;
  className?: string;
};

const ActivityIcon = memo<ActivityIconProps>(({ item, className }) => {
  const isPopupMode = isPopup();

  return item.source.type === "page" ? (
    <Avatar
      src={item.source.favIconUrl}
      alt={item.source.url}
      className={classNames(
        "block",
        "bg-white",
        "rounded-full overflow-hidden",
        isPopupMode ? "w-8 h-8 min-w-[2rem]" : "w-12 h-12 min-w-[3rem]",
        className,
      )}
      fallbackClassName="!h-3/5"
    />
  ) : (
    <SendIcon
      className={classNames(
        "styled-icon--active",
        isPopupMode ? "w-8 h-8" : "w-12 h-12",
        className,
      )}
    />
  );
});

type ActivityTypeLabelProps = {
  item: Activity;
  className?: string;
};

const ActivityTypeLabel: FC<ActivityTypeLabelProps> = ({ item, className }) => {
  const isPopupMode = isPopup();

  const name = useMemo(() => {
    if (
      item.type === ActivityType.Transaction &&
      item.txAction?.type === TxActionType.TokenTransfer
    ) {
      return "Transfer";
    }
    if (item.type === ActivityType.Ramp && item.kind === "onramp") {
      return "Buy";
    }

    return item.type;
  }, [item]);

  const Icon = getActivityIcon(item.type);
  return (
    <div
      className={classNames(
        "flex items-center",
        isPopupMode ? "text-sm" : "text-base",
        "text-brand-inactivelight font-medium",
        className,
      )}
    >
      <Icon
        className={classNames(isPopupMode ? "w-4 mr-1" : "w-5 mr-2", "h-auto")}
      />
      {capitalize(name)}
    </div>
  );
};

type ActivityTypeStatusProps = {
  status?: StatusType;
  className?: string;
};

const ActivityTypeStatus: FC<ActivityTypeStatusProps> = ({
  status,
  className,
}) => {
  const greyColorStatuses: StatusType[] = useMemo(
    () => ["revoked", "expired", "refunded", "cancelled"],
    [],
  );

  if (!status) {
    return null;
  }

  return (
    <div
      className={classNames(
        "text-xs font-medium",
        status === "succeeded" && "text-brand-greenobject",
        status === "failed" && "text-brand-redtext",
        status === "skipped" && "text-brand-main",
        greyColorStatuses.includes(status) && "text-brand-inactivedark",
        className,
      )}
    >
      {capitalize(status === "succeeded" ? "success" : status)}
    </div>
  );
};

const getActivityIcon = (type: ActivityType) => {
  switch (type) {
    case ActivityType.Connection:
      return ActivityConnectionIcon;
    case ActivityType.Signing:
      return ActivitySigningIcon;
    case ActivityType.Ramp:
      return ActivityOnRampIcon;
    default:
      return ActivityTransactionIcon;
  }
};

type ActivityWebsiteLinkProps = {
  source: ActivitySource;
  className?: string;
};

const ActivityWebsiteLink: FC<ActivityWebsiteLinkProps> = ({
  source,
  className,
}) => {
  const isPopupMode = isPopup();
  const handleLinkClick = useCallback(() => {
    if (source.type === "page") {
      openInTabExternal(source.url, source.tabId);
    }
  }, [source]);

  if (source.type !== "page") return null;

  return (
    <button
      onClick={handleLinkClick}
      className={classNames(
        "cursor-pointer",
        "min-w-0",
        "hover:underline",
        "inline-flex items-center",
        className,
      )}
    >
      <span
        className={classNames(
          "min-w-0 truncate",
          isPopupMode ? "text-xs" : "text-base",
        )}
      >
        {new URL(source.url).host}
      </span>
      <LinkIcon
        className={
          isPopupMode
            ? "ml-0.5 w-4 h-4 min-w-[1rem]"
            : "ml-1 w-5 h-5 min-w-[1.25rem]"
        }
      />
    </button>
  );
};

type ActivityNetworkCardProps = {
  chainId: number;
  fee?: {
    native: BigNumber.Value;
    fiat?: BigNumber.Value;
  };
  className?: string;
};

const ActivityNetworkCard: FC<ActivityNetworkCardProps> = ({
  chainId,
  fee,
  className,
}) => {
  const isPopupMode = isPopup();
  const network = useLazyAtomValue(getNetworkAtom(chainId));

  const label = (
    <div
      className={classNames(
        "flex items-center",
        "min-w-0",
        isPopupMode ? "min-h-[1.125rem]" : "min-h-[1.5rem]",
        fee ? "" : className,
      )}
    >
      {network && (
        <Avatar
          src={getNetworkIconUrl(network)}
          alt={network?.name}
          withBorder={false}
          className={
            isPopupMode
              ? "w-[1.125rem] min-w-[1.125rem] mr-1.5"
              : "w-6 mr-2 min-w-[1.5rem]"
          }
        />
      )}

      <span
        className={classNames(
          "truncate min-w-0",
          isPopupMode ? "text-xs" : "text-base",
        )}
      >
        {network?.name}
      </span>
    </div>
  );

  if (!fee) {
    return label;
  }

  return (
    <div
      className={classNames(
        "flex",
        isPopupMode ? "items-center justify-between" : "flex-col",
        className,
      )}
    >
      {label}
      <span
        className={classNames(
          "flex items-center text-brand-inactivedark",
          isPopupMode ? "ml-4" : "ml-8 mt-1",
        )}
      >
        <PrettyAmount
          amount={fee.native}
          currency={network?.nativeCurrency?.symbol}
          decimals={network?.nativeCurrency?.decimals}
          copiable
          prefix={<GasIcon className="w-3 h-3 mr-1" />}
          threeDots={false}
          className="text-xs font-semibold flex items-center"
        />
        {fee.fiat && (
          <>
            <Dot className="!p-1" />
            <FiatAmount
              amount={fee.fiat}
              threeDots={false}
              copiable
              className="text-xs"
            />
          </>
        )}
      </span>
    </div>
  );
};

type ActivityTxActionsProps = {
  item: TransactionActivity | RampActivity;
  className?: string;
};

const SupportAlertContent: FC<{ orderId: string; isPopupMode: boolean }> = ({
  orderId,
  isPopupMode,
}) => {
  const { copy, copied } = useCopyToClipboard(orderId);
  const [disabled, setDisabled] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setDisabled(false);
    }, 0);
  }, []);

  return (
    <div className="flex flex-col items-start">
      <div className="flex flex-col">
        <p className="text-left">
          For assistance with card-based crypto balance top-ups, contact our
          payment partner Transak. Please provide your{" "}
          <span className="text-white">Order ID</span> at their Help Center for
          transaction-related issues.
        </p>
        <div className="mb-3 flex items-center gap-2">
          <p>
            <b className="text-white">Order ID:</b> {orderId}
          </p>
          <IconedButton
            aria-label={copied ? "Copied" : "Copy Order ID"}
            tooltipProps={{
              placement: "top",
              disabled,
            }}
            Icon={copied ? SuccessIcon : CopyIcon}
            className={isPopupMode ? undefined : "!w-6 !h-6 min-w-[1.5rem]"}
            iconClassName={isPopupMode ? undefined : "!w-[1.125rem]"}
            onClick={() => copy()}
          />
        </div>
      </div>
      <Button
        href={TRANSAK_SUPPORT_URL}
        className="!p-0 underline"
        theme="clean"
      >
        Go to the Transak Help Center
        <WalletExplorerIcon className="ml-1" />
      </Button>
    </div>
  );
};

const ActivityTxActions: FC<ActivityTxActionsProps> = ({ item, className }) => {
  const isPopupMode = isPopup();
  const { alert } = useDialog();
  const network = useLazyNetwork();
  const explorerLink = useExplorerLink(network);

  const isRampActivity = useMemo(
    () => item.type === ActivityType.Ramp,
    [item.type],
  );

  const { copy, copied } = useCopyToClipboard();

  if (isRampActivity) {
    return (
      <div className={classNames("flex items-center", className)}>
        <IconedButton
          aria-label={copied ? "Copied" : "Copy Order ID"}
          Icon={copied ? SuccessIcon : CopyIcon}
          className={isPopupMode ? undefined : "!w-6 !h-6 min-w-[1.5rem]"}
          iconClassName={isPopupMode ? undefined : "!w-[1.125rem]"}
          onClick={() => copy((item as RampActivity).partnerOrderId)}
        />
        {explorerLink && (
          <IconedButton
            aria-label="Help"
            Icon={ChatIcon}
            className={isPopupMode ? "ml-1" : "!w-6 !h-6 min-w-[1.5rem] ml-2"}
            iconClassName={isPopupMode ? undefined : "!w-[1.125rem]"}
            onClick={() => {
              alert({
                title: "Help with a transaction",
                content: (
                  <SupportAlertContent
                    isPopupMode={isPopupMode}
                    orderId={(item as RampActivity).partnerOrderId}
                  />
                ),
              });
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div className={classNames("flex items-center", className)}>
      <IconedButton
        aria-label={copied ? "Copied" : "Copy transaction hash"}
        Icon={copied ? SuccessIcon : CopyIcon}
        className={isPopupMode ? undefined : "!w-6 !h-6 min-w-[1.5rem]"}
        iconClassName={isPopupMode ? undefined : "!w-[1.125rem]"}
        onClick={() => copy((item as TransactionActivity).txHash)}
      />
      {explorerLink && (
        <IconedButton
          aria-label="View the transaction in Explorer"
          Icon={WalletExplorerIcon}
          className={isPopupMode ? "ml-1" : "!w-6 !h-6 min-w-[1.5rem] ml-2"}
          iconClassName={isPopupMode ? undefined : "!w-[1.125rem]"}
          href={explorerLink.tx((item as TransactionActivity).txHash)}
        />
      )}
    </div>
  );
};

type ActivityTokensProps = {
  source: ActivitySource;
  action?: TxAction;
  accountAddress: string;
  className?: string;
};

const ActivityTokens = memo<ActivityTokensProps>(
  ({ source, action, accountAddress, className }) => {
    const isPopupMode = isPopup();

    if (
      source.type !== "self" ||
      !action ||
      action.type !== TxActionType.TokenTransfer ||
      action.tokens?.length === 0
    ) {
      return null;
    }

    return (
      <div className={classNames("flex flex-col", className)}>
        {action.tokens.map((token, i) => (
          <TokenAmount
            key={token.slug}
            accountAddress={accountAddress}
            token={token}
            className={classNames(i !== action.tokens.length - 1 && "mb-1")}
            isSmall={isPopupMode}
          />
        ))}
      </div>
    );
  },
);

function capitalize(word: string) {
  const lower = word.toLowerCase();
  return `${word.charAt(0).toUpperCase()}${lower.slice(1)}`;
}

const RampDetailsBlock: FC<{ item: RampActivity; isPopupMode?: boolean }> = ({
  item,
  isPopupMode = false,
}) => {
  const {
    status,
    statusReason,
    accountAddress,
    chainId,
    tokenSlug,
    amountInCrypto,
  } = item;

  if (["REFUNDED", "EXPIRED"].includes(status)) {
    return <p className="text-brand-font">{capitalize(status)}</p>;
  }

  if (status === "FAILED") {
    return <p className="text-brand-font">{capitalize(statusReason)}</p>;
  }

  return (
    <ChainIdProvider chainId={chainId}>
      <TokenAmount
        rawAmount
        isSmall={isPopupMode}
        accountAddress={accountAddress}
        token={{
          slug: tokenSlug,
          amount: String(amountInCrypto),
        }}
      />
    </ChainIdProvider>
  );
};

export default ActivityAsset;
