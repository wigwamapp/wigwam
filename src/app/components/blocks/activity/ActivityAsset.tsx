import {
  ButtonHTMLAttributes,
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
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { omit } from "lib/system/omit";
import { useLazyAtomValue } from "lib/atom-utils";
import { useCopyToClipboard } from "lib/react-hooks/useCopyToClipboard";
import { useSafeState } from "lib/react-hooks/useSafeState";
import { isPopup } from "lib/ext/view";
import { useIsMounted } from "lib/react-hooks/useIsMounted";

import {
  Activity,
  ActivitySource,
  ActivityType,
  SelfActivityKind,
  ConnectionActivity,
  RampActivity,
  TransactionActivity,
  TxAction,
  TxActionType,
} from "core/types";
import { getPageOrigin } from "core/common/permissions";
import * as repo from "core/repo";
import { ClientProvider } from "core/client";
import { saveNonce } from "core/common/nonce";

import { getNetworkAtom, getPermissionAtom } from "app/atoms";
import { TRANSAK_SUPPORT_URL } from "app/defaults";
import {
  ChainIdProvider,
  useAccounts,
  useExplorerLink,
  useLazyNetwork,
} from "app/hooks";
import { openInTabExternal } from "app/utils";
import { useDialog } from "app/hooks/dialog";
import { useToast } from "app/hooks/toast";
import { ReactComponent as SendIcon } from "app/icons/Send.svg";
import { ReactComponent as SwapIcon } from "app/icons/SwapIcon.svg";
import { ReactComponent as RewardsIcon } from "app/icons/Rewards.svg";
import { ReactComponent as BridgeIcon } from "app/icons/bridge.svg";
import { ReactComponent as SwapIconSmall } from "app/icons/activity-swap.svg";
import { ReactComponent as ApproveIcon } from "app/icons/approve.svg";
import { ReactComponent as ChatIcon } from "app/icons/communication.svg";
import { ReactComponent as ReceiveIcon } from "app/icons/Receive.svg";
import { ReactComponent as BanIcon } from "app/icons/ban.svg";
import { ReactComponent as EyeIcon } from "app/icons/eye.svg";
import { ReactComponent as OptionsHorizontal } from "app/icons/options-horizontal.svg";
import { ReactComponent as AlertTriangle } from "app/icons/alert-triangle.svg";
import {
  ReactComponent as LinkIcon,
  ReactComponent as WalletExplorerIcon,
} from "app/icons/external-link.svg";
import { ReactComponent as SuccessIcon } from "app/icons/success.svg";
import { ReactComponent as CopyIcon } from "app/icons/copy.svg";
import { ReactComponent as ActivityConnectionIcon } from "app/icons/activity-connection.svg";
import { ReactComponent as ActivitySigningIcon } from "app/icons/activity-signing.svg";
import { ReactComponent as ActivityTransactionIcon } from "app/icons/transaction.svg";
import { ReactComponent as ActivityOnRampIcon } from "app/icons/activity-onramp.svg";
import { ReactComponent as GasIcon } from "app/icons/gas.svg";
import { ReactComponent as ExternalLinkIcon } from "app/icons/external-link.svg";

import TokenAmount from "../../blocks/TokenAmount";
import Button from "../../elements/Button";
import Avatar from "../../elements/Avatar";
import PrettyDate from "../../elements/PrettyDate";
import IconedButton from "../../elements/IconedButton";
import PrettyAmount from "../../elements/PrettyAmount";
import FiatAmount from "../../elements/FiatAmount";
import Dot from "../../elements/Dot";
import Tooltip from "../../elements/Tooltip";
import TooltipIcon from "../../elements/TooltipIcon";
import CircleSpinner from "../../elements/CircleSpinner";
import NetworkIcon from "app/components/elements/NetworkIcon";

type StatusType =
  | "pending"
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
      if (item.pending) {
        return "pending";
      }

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

      let native = new BigNumber(item.result.gasUsed)
        .times(
          item.result.effectiveGasPrice ??
            parsedTx.maxFeePerGas ??
            parsedTx.gasPrice,
        )
        .toString();

      if ("l1Fee" in item.result) {
        try {
          native = new BigNumber(native)
            .plus(item.result.l1Fee as any)
            .toString();
        } catch {}
      }

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
            <div className="flex items-center gap-2">
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
                  item={item}
                  fee={fee}
                  className="mt-1.5 min-w-0"
                />
              </div>
            )}
            <ActivitySwap item={item} txAction={item.txAction} />
            {item.type === ActivityType.Ramp && (
              <div className="flex flex-col mt-2 pt-2 border-t border-brand-main/[.07] ">
                <ChainIdProvider chainId={item.chainId}>
                  <div className="flex items-center justify-between min-w-0">
                    <ActivityTokens
                      source={item.source}
                      accountAddress={item.accountAddress}
                    />

                    <RampDetailsBlock item={item} isPopupMode />
                  </div>
                </ChainIdProvider>

                <ActivityNetworkCard item={item} className="mt-1.5 min-w-0" />
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
                item={item}
                fee={fee}
                className="w-[12rem] mr-8"
              />
            )}

            {item.type === ActivityType.Ramp && (
              <ActivityNetworkCard item={item} className="w-[12rem] mr-8" />
            )}

            {item.type !== ActivityType.Ramp && item.source.type === "page" && (
              <ActivityWebsiteLink
                source={item.source}
                className="w-[9rem] mr-8"
              />
            )}

            <ActivitySwap item={item} txAction={item.txAction} />

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
              <ChainIdProvider chainId={item.chainId}>
                <RampDetailsBlock item={item} />
              </ChainIdProvider>
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

export default ActivityAsset;

type DisconnectDAppProps = {
  item: ConnectionActivity;
  setRevokedPermission: (r: true) => void;
  className?: string;
};

const DisconnectDApp = memo<DisconnectDAppProps>(
  ({ item, className, setRevokedPermission }) => {
    const { currentAccount } = useAccounts();
    const isPopupMode = isPopup();
    const origin = useMemo(() => getPageOrigin(item.source), [item.source]);
    const lazyPermission = useAtomValue(loadable(getPermissionAtom(origin)));
    const permission =
      lazyPermission.state === "hasData" ? lazyPermission.data : undefined;

    useEffect(() => {
      if (
        lazyPermission.state === "hasData" &&
        (!lazyPermission.data ||
          !lazyPermission.data.accountAddresses.includes(
            currentAccount.address,
          ))
      ) {
        setTimeout(() => setRevokedPermission(true), 0);
      }
    }, [lazyPermission, setRevokedPermission, currentAccount.address]);

    const handleDisconnect = useCallback(async () => {
      if (!permission) return;

      try {
        await repo.permissions.delete(permission.origin);
      } catch (err) {
        console.error(err);
      }
    }, [permission]);

    if (!permission) return null;
    if (!permission.accountAddresses.includes(currentAccount.address))
      return null;

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

  if (item.source.type === "page") {
    return (
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
    );
  }

  const Icon = (() => {
    switch (true) {
      case item.type === ActivityType.Ramp:
        return ReceiveIcon;

      case item.source.kind === SelfActivityKind.Swap:
        return SwapIcon;

      case item.source.kind === SelfActivityKind.Reward:
        return RewardsIcon;

      default:
        return SendIcon;
    }
  })();

  return (
    <Icon
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
      item.source.type === "self" &&
      item.source.kind === SelfActivityKind.Swap &&
      item.txAction?.type !== "TOKEN_APPROVE"
    ) {
      if (item.chainId === item.source?.swapMeta?.toChainId) {
        return "Swap";
      } else {
        return "Bridge";
      }
    }

    if (
      item.source.type === "self" &&
      item.source.kind === SelfActivityKind.Swap &&
      item.txAction?.type === "TOKEN_APPROVE"
    ) {
      return "Approve";
    }
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

  const Icon = getActivityIcon(
    item.type,
    item.source.type === "self" ? item.source.kind : null,
    item,
  );

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
        "text-xs font-medium inline-flex items-center",
        status === "succeeded" && "text-brand-greenobject",
        status === "failed" && "text-brand-redtext",
        status === "skipped" && "text-brand-main",
        status === "pending" && "text-[#d99e2e]",
        greyColorStatuses.includes(status) && "text-brand-inactivedark",
        className,
      )}
    >
      {status === "pending" && (
        <CircleSpinner className="mr-1 !w-3 !h-3 !text-brand-inactivelight" />
      )}
      {capitalize(status === "succeeded" ? "success" : status)}
    </div>
  );
};

const getActivityIcon = (
  type: ActivityType,
  kind: SelfActivityKind | null,
  item: any,
) => {
  switch (type) {
    case ActivityType.Connection:
      return ActivityConnectionIcon;
    case ActivityType.Signing:
      return ActivitySigningIcon;
    case ActivityType.Ramp:
      return ActivityOnRampIcon;
    default:
      if (kind && kind === SelfActivityKind.Swap) {
        if (item.txAction.type === "TOKEN_APPROVE") {
          return ApproveIcon;
        }
        if (item.chainId === item.source?.swapMeta?.toChainId) {
          return SwapIconSmall;
        } else {
          return BridgeIcon;
        }
      } else {
        return ActivityTransactionIcon;
      }
  }
};

type ActivitySwapProps = {
  item: Activity;
  txAction: TxAction | undefined;
};

const ActivitySwap: FC<ActivitySwapProps> = ({ item, txAction }) => {
  const isPopupMode = isPopup();
  const source = item.source;

  if (
    source.type === "self" &&
    source.kind === SelfActivityKind.Swap &&
    source.swapMeta &&
    txAction?.type !== "TOKEN_APPROVE"
  ) {
    const route = source?.swapMeta;
    return (
      <div
        className={classNames(
          "flex items-center",
          isPopupMode ? "flex-inline w-auto mt-1.5" : "flex-col w-[12rem]",
        )}
      >
        <div className="inline-flex">
          <PrettyAmount
            amount={route.fromAmount}
            decimals={route.fromToken.decimals}
            currency={route.fromToken.symbol}
            threeDots={false}
            copiable
            className={classNames("text-xs ml-1.5", "font-bold")}
          />{" "}
          <img
            src={route.fromToken.logoURI}
            alt={route.fromToken.name}
            className="ml-1 w-4 h-4 rounded-full"
          />
        </div>
        <div
          className={classNames("text-xs font-bold", isPopupMode && "ml-1.5")}
        >
          {isPopupMode ? "→" : "↓"}
        </div>
        <div className="inline-flex">
          <PrettyAmount
            amount={route.toAmount}
            decimals={route.toToken.decimals}
            currency={route.toToken.symbol}
            threeDots={false}
            copiable
            className={classNames("text-xs ml-1.5", "font-bold")}
          />{" "}
          <img
            src={route.toToken.logoURI}
            alt={route.toToken.name}
            className="ml-1 w-4 h-4 rounded-full"
          />
        </div>
      </div>
    );
  } else if (
    source.type === "self" &&
    source.kind === SelfActivityKind.Swap &&
    source.swapMeta &&
    txAction?.type === "TOKEN_APPROVE"
  ) {
    const route = source?.swapMeta;

    return (
      <div
        className={classNames(
          "flex items-center",
          isPopupMode ? "flex-inline w-auto mt-1.5" : "flex-col w-[12rem]",
        )}
      >
        <div className="inline-flex">
          <PrettyAmount
            amount={route.fromAmount}
            decimals={route.fromToken.decimals}
            currency={route.fromToken.symbol}
            threeDots={false}
            copiable
            className={classNames("text-xs ml-1.5", "font-bold")}
          />{" "}
          <img
            src={route.fromToken.logoURI}
            alt={route.fromToken.name}
            className="ml-1 w-4 h-4 rounded-full"
          />
        </div>
      </div>
    );
  } else {
    return null;
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
  item: TransactionActivity | RampActivity;
  fee?: {
    native: BigNumber.Value;
    fiat?: BigNumber.Value;
  };
  className?: string;
};

const ActivityNetworkCard: FC<ActivityNetworkCardProps> = ({
  item,
  fee,
  className,
}) => {
  const isPopupMode = isPopup();
  const network = useLazyAtomValue(getNetworkAtom(item.chainId));

  const [optionsOpened, setOptionsOpened] = useState(false);

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
        <NetworkIcon
          network={network}
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

  const pendingChainTx =
    item.type === ActivityType.Transaction && Boolean(item.pending);

  if (!fee && !pendingChainTx) {
    return label;
  }

  return (
    <DropdownMenu.Root open={optionsOpened} onOpenChange={setOptionsOpened}>
      <div
        className={classNames(
          "flex",
          isPopupMode ? "items-center justify-between" : "flex-col items-start",
          className,
        )}
      >
        {label}

        {fee ? (
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
              isDecimalsMinified
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
                  isDecimalsMinified
                  copiable
                  className="text-xs"
                />
              </>
            )}
          </span>
        ) : (
          <DropdownMenu.Trigger asChild>
            <button
              type="button"
              className={classNames(
                isPopupMode ? "ml-4" : "ml-8 mt-1",
                "w-auto border border-brand-main/20",
                "rounded-md inline-flex items-center",
                "px-2",
                isPopupMode ? "text-[.625rem] h-5" : "text-xs py-0.5",
                "text-brand-inactivelight",
                "transition-colors",
                "hover:bg-brand-main/10",
              )}
              tabIndex={-1}
            >
              <OptionsHorizontal className={classNames("w-4 h-4 mr-0.5")} />
              Options
            </button>
          </DropdownMenu.Trigger>
        )}
      </div>

      {pendingChainTx && (
        <TxOptionsDropdown
          item={item}
          onOptionsClose={() => setOptionsOpened(false)}
        />
      )}
    </DropdownMenu.Root>
  );
};

const TX_OPTIONS = {
  speedup: {
    Icon: GasIcon,
    title: "Speed up",
  },
  cancel: {
    Icon: BanIcon,
    title: "Cancel",
  },
  hide: {
    Icon: EyeIcon,
    title: "Hide",
  },
} as const;

const TxOptionsDropdown = memo(
  ({
    item,
    onOptionsClose,
  }: {
    item: TransactionActivity;
    onOptionsClose: () => void;
  }) => {
    const isPopupMode = isPopup();
    const { alert, confirm } = useDialog();
    const network = useLazyNetwork();
    const explorerLink = useExplorerLink(network);
    const isMounted = useIsMounted();
    const { updateToast } = useToast();

    const fullTx = useMemo(() => {
      if (!item.pending || item.type !== ActivityType.Transaction) return null;

      return Transaction.from(item.rawTx);
    }, [item]);

    const txOption = useCallback(
      async (type: keyof typeof TX_OPTIONS) => {
        if (!fullTx) return;

        try {
          const { Icon, title } = TX_OPTIONS[type];

          const pendingActivities = await repo.queryActivities({
            accountAddress: item.accountAddress,
            pending: true,
          });

          let txsBelowCount: number | null = null;
          for (const a of pendingActivities) {
            if (
              a.type === ActivityType.Transaction &&
              a.chainId === item.chainId
            ) {
              if (a.id === item.id) {
                txsBelowCount = 0;
              } else if (txsBelowCount !== null) {
                txsBelowCount++;
              }
            }
          }

          const confimed = await confirm({
            title: (
              <span className="inline-flex items-center">
                <Icon className="w-5 h-5 mr-2" />
                Confirm tx <span className="ml-1 lowercase">{title}</span>
              </span>
            ),
            content: (
              <div className="-mt-4 text-sm">
                <p className="mb-4 text-lg font-medium text-brand-inactivelight">
                  Are you sure you want to <b className="lowercase">{title}</b>{" "}
                  this transaction?
                </p>

                {txsBelowCount ? (
                  <div
                    className={classNames(
                      "-mt-2 mb-2 -ml-[0.5rem]",
                      "w-[calc(100%+[0.5rem)]",
                      "py-2 pr-2",
                      "bg-black/10 border border-white/5 rounded-lg",
                      "flex items-start",
                    )}
                  >
                    <div className="w-7 mx-2">
                      <AlertTriangle className="h-5 w-5 text-[#d99e2e]" />
                    </div>
                    <p className="text-sm text-left">
                      <b className="text-[#d99e2e]">Attension!</b> You have
                      another pending transactions below in the stack. This
                      transaction will not execute until the previous
                      transaction has confirmed. Frequently, it may be better to{" "}
                      <b className="lowercase">{title}</b> older transactions.
                    </p>
                  </div>
                ) : null}

                <div className="text-left prose prose-invert prose-sm">
                  <ul className="list-outside">
                    {type === "speedup" ? (
                      <li>
                        This will let you re-submit the same transaction, but
                        with a higher gas fee that should allow the transaction
                        to be processed faster. Since this process re-uses the
                        same nonce as the original, you do not need to pay for
                        gas twice.
                      </li>
                    ) : type === "cancel" ? (
                      <>
                        <li>
                          This will let you re-submit this transaction with an
                          empty one. Since this process re-uses the same nonce
                          as the original, you do not need to pay for gas twice.
                        </li>
                        <li>
                          Please note, a cancellation can only be attempted if
                          the transaction is still pending on the network.
                          Transactions that have already been confirmed cannot
                          be reversed.
                        </li>
                      </>
                    ) : (
                      <>
                        <li>
                          This will hide this transaction{" "}
                          <b>only inside the Wigwam applicaiton</b>. This means
                          you should only proceed if you are certain that the
                          transaction was lost.
                        </li>
                        <li>
                          All pending transactions above will also be hidden.
                        </li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            ),
            noButtonText: "Back",
            yesButtonText: "Yes, continue",
          });
          if (!confimed) return;

          onOptionsClose();

          const provider = new ClientProvider(item.chainId);

          if (type === "hide") {
            const idsToDelete: string[] = [];
            const txHashesToDelete: string[] = [];
            let maxFreeNonce: number | undefined;

            for (const activity of pendingActivities) {
              if (
                activity.type === ActivityType.Transaction &&
                activity.chainId === item.chainId
              ) {
                try {
                  const { nonce } = Transaction.from(activity.rawTx);

                  if (nonce >= fullTx.nonce) {
                    idsToDelete.push(activity.id);
                    txHashesToDelete.push(activity.txHash);
                  } else {
                    if (!maxFreeNonce || maxFreeNonce < nonce) {
                      maxFreeNonce = nonce;
                    }
                  }
                } catch (err) {
                  console.warn(err);
                }
              }
            }

            if (!maxFreeNonce) {
              maxFreeNonce =
                (await provider.getTransactionCount(item.accountAddress)) - 1;
            }

            await saveNonce(
              item.chainId,
              item.accountAddress,
              maxFreeNonce,
              true,
            );

            await repo.activities.bulkDelete(idsToDelete);
            for (const txHash of txHashesToDelete) {
              await repo.tokenActivities.where({ txHash, pending: 1 }).delete();
            }
          } else {
            const parsedTx = Transaction.from(item.rawTx);

            provider.setActivitySource({
              ...item.source,
              replaceTx: {
                type,
                prevActivityId: item.id,
                prevTxHash: item.txHash,
                prevTxGasPrice:
                  item.result?.effectiveGasPrice ??
                  parsedTx.maxFeePerGas?.toString() ??
                  parsedTx.gasPrice?.toString(),
                prevReplaceTxType: item.source.replaceTx?.type,
                prevTimeAt: item.timeAt,
              },
            });

            // Get base params
            const txParams = omit(
              item.txParams,
              "gasLimit",
              "gasPrice",
              "maxFeePerGas",
              "maxPriorityFeePerGas",
            );

            // Set prev nonce
            txParams.nonce = fullTx.nonce;

            // Emptify tx if cancel action
            if (type === "cancel") {
              delete txParams.data;

              txParams.to = ethers.ZeroAddress;
              txParams.value = "0x0";
            }

            const txResPromise = provider.send("eth_sendTransaction", [
              txParams,
            ]);

            txResPromise
              .then((txHash) => {
                setTimeout(() => {
                  if (!isMounted()) return;

                  updateToast(
                    <div className="flex flex-col">
                      <p>
                        Transaction successfully replaced in blockchain!
                        Confirming...
                      </p>

                      {explorerLink && (
                        <a
                          href={explorerLink.tx(txHash)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 underline"
                        >
                          View the transaction in{" "}
                          <span className="whitespace-nowrap">
                            explorer
                            <ExternalLinkIcon className="h-5 w-auto ml-1 inline-block" />
                          </span>
                        </a>
                      )}
                    </div>,
                  );
                }, 100);
              })
              .catch(console.warn);
          }
        } catch (err: any) {
          alert({
            title: "Error!",
            content: err?.message || "Something went wrong",
          });
        }
      },
      [
        item,
        confirm,
        alert,
        updateToast,
        isMounted,
        explorerLink,
        fullTx,
        onOptionsClose,
      ],
    );

    return (
      <DropdownMenu.Content
        side={isPopupMode ? "left" : "right"}
        sideOffset={4}
        align="start"
        className={classNames(
          "bg-brand-darkgray",
          "rounded-md",
          "overflow-hidden truncate",
          "border border-white/5",
          "px-1 py-2",
          "z-[1]",
        )}
      >
        {/* <div className="mx-2 pb-1 w-[calc(100%-1rem)] mb-1 border-b border-white/5 flex items-center">
          <span className="text-xs text-brand-inactivelight">Nonce:</span>{" "}
          <span className="font-mono">{fullTx!.nonce}</span>
        </div> */}

        {Object.entries(TX_OPTIONS).map(([key, { Icon, title }]) => (
          <PopoverButton
            key={key}
            Icon={Icon}
            onClick={() => txOption(key as any)}
            disabled={
              key === "cancel" && item.source.replaceTx?.type === "cancel"
            }
          >
            {title}
          </PopoverButton>
        ))}
      </DropdownMenu.Content>
    );
  },
);

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

type ActivityTxActionsProps = {
  item: TransactionActivity | RampActivity;
  className?: string;
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
          href={
            item.source.type === "self" &&
            item.source.kind === SelfActivityKind.Swap
              ? explorerLink.lifi((item as TransactionActivity).txHash)
              : explorerLink.tx((item as TransactionActivity).txHash)
          }
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

    if (
      source.replaceTx?.type === "cancel" ||
      source.replaceTx?.prevReplaceTxType === "cancel"
    ) {
      return (
        <div className="flex items-center">
          <Tooltip
            content={
              <p>
                The transaction was cancelled. It was replaced by an empty
                transaction directly in the blockchain.
              </p>
            }
            size="large"
            placement="bottom"
            interactive={false}
          >
            <TooltipIcon theme="light" className="!w-4 !h-4 mr-1.5" />
          </Tooltip>
          <span className="text-sm font-medium text-brand-inactivedark">
            Cancelled
          </span>
        </div>
      );
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
  const { status, statusReason, accountAddress, tokenSlug, amountInCrypto } =
    item;

  if (["REFUNDED", "EXPIRED"].includes(status)) {
    return <p className="text-brand-font">{capitalize(status)}</p>;
  }

  if (status === "FAILED") {
    return <p className="text-brand-font">{capitalize(statusReason)}</p>;
  }

  return (
    <TokenAmount
      rawAmount
      isSmall={isPopupMode}
      accountAddress={accountAddress}
      token={{
        slug: tokenSlug,
        amount: String(amountInCrypto),
      }}
    />
  );
};

type PopoverButton = ButtonHTMLAttributes<HTMLButtonElement> & {
  Icon: FC<{ className?: string }>;
};

const PopoverButton: FC<PopoverButton> = ({ Icon, children, ...rest }) => (
  <button
    type="button"
    className={classNames(
      "flex items-center",
      "min-w-[6rem] w-full px-2 py-1",
      "rounded-[.625rem]",
      "text-sm font-semibold",
      "transition-colors",
      !rest.disabled && "hover:bg-brand-main/20 focus:bg-brand-main/20",
      "disabled:opacity-40 disabled:cursor-default",
    )}
    {...rest}
  >
    <Icon className="h-4 w-4 mr-1.5" />
    {children}
  </button>
);
