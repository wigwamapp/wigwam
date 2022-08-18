import {
  FC,
  forwardRef,
  memo,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import classNames from "clsx";
import * as Dialog from "@radix-ui/react-dialog";
import { useAtom, useAtomValue } from "jotai";
import { loadable } from "jotai/utils";
import BigNumber from "bignumber.js";
import { ethers } from "ethers";
import browser from "webextension-polyfill";
import { useLazyAtomValue } from "lib/atom-utils";
import { useIsMounted } from "lib/react-hooks/useIsMounted";
import { useCopyToClipboard } from "lib/react-hooks/useCopyToClipboard";
import { useSafeState } from "lib/react-hooks/useSafeState";

import { getNetworkIconUrl } from "fixtures/networks";
import {
  Activity,
  ActivitySource,
  ActivityType,
  ConnectionActivity,
  TransactionActivity,
  TxAction,
  TxActionType,
} from "core/types";
import { rejectAllApprovals } from "core/client";
import { getPageOrigin } from "core/common/permissions";
import * as repo from "core/repo";

import {
  activityModalAtom,
  allAccountsAtom,
  approvalStatusAtom,
  getNetworkAtom,
  getPermissionAtom,
  pendingActivityAtom,
} from "app/atoms";
import { IS_FIREFOX, LOAD_MORE_ON_ACTIVITY_FROM_END } from "app/defaults";
import {
  ChainIdProvider,
  OverflowProvider,
  useCompleteActivity,
  useExplorerLink,
  useLazyNetwork,
} from "app/hooks";
import { openInTabExternal } from "app/utils";
import { ReactComponent as SendIcon } from "app/icons/Send-activity.svg";
import { ReactComponent as LinkIcon } from "app/icons/external-link.svg";
import { ReactComponent as SuccessIcon } from "app/icons/success.svg";
import { ReactComponent as CopyIcon } from "app/icons/copy.svg";
import { ReactComponent as WalletExplorerIcon } from "app/icons/external-link.svg";
import { ReactComponent as ActivityConnectionIcon } from "app/icons/activity-connection.svg";
import { ReactComponent as ActivitySigningIcon } from "app/icons/activity-signing.svg";
import { ReactComponent as ActivityTransactionIcon } from "app/icons/activity-transaction.svg";
import { ReactComponent as GasIcon } from "app/icons/gas.svg";
import { ReactComponent as ActivityGlassIcon } from "app/icons/activity-glass.svg";
import { ReactComponent as NoResultsFoundIcon } from "app/icons/no-activity.svg";

import Button from "../elements/Button";
import ScrollAreaContainer from "../elements/ScrollAreaContainer";
import Avatar from "../elements/Avatar";
import AutoIcon from "../elements/AutoIcon";
import WalletName from "../elements/WalletName";
import HashPreview from "../elements/HashPreview";
import PrettyDate from "../elements/PrettyDate";
import IconedButton from "../elements/IconedButton";
import PrettyAmount from "../elements/PrettyAmount";
import FiatAmount from "../elements/FiatAmount";
import Dot from "../elements/Dot";
import TokenAmount from "../blocks/TokenAmount";

import ApprovalStatus from "./ApprovalStatus";

const ActivityModal = memo(() => {
  const [activityOpened, setActivityOpened] = useAtom(activityModalAtom);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      setActivityOpened([open, "replace"]);
    },
    [setActivityOpened]
  );

  const isMounted = useIsMounted();
  const bootAnimationDisplayed = activityOpened && isMounted();

  return (
    <Dialog.Root open={activityOpened} onOpenChange={handleOpenChange} modal>
      <Dialog.Portal>
        <Dialog.Overlay
          className={classNames("fixed inset-0 z-20", "bg-brand-darkblue/50")}
        />
        <Dialog.Content
          onOpenAutoFocus={(e) => e.preventDefault()}
          className={classNames(
            "fixed z-20",
            "w-full max-w-6xl min-w-[40rem]",
            "max-h-[41rem]",
            "m-auto inset-x-0 inset-y-[3.5rem]",
            "rounded-[2.5rem]",
            bootAnimationDisplayed && "animate-modalcontent"
          )}
        >
          <div
            className={classNames(
              "flex items-center justify-center",
              "w-[5.5rem] h-[5.5rem]",
              "rounded-full",
              "bg-brand-dark/20",
              "backdrop-blur-[10px]",
              IS_FIREFOX && "!bg-[#0D1020]",
              "border border-brand-light/5",
              "shadow-addaccountmodal",
              "absolute",
              "top-0 left-1/2",
              "-translate-x-1/2 -translate-y-1/2",
              "z-30"
            )}
          >
            <ActivityGlassIcon className="w-12 h-auto mb-0.5" />
          </div>
          <OverflowProvider>
            {(ref) => (
              <ScrollAreaContainer
                ref={ref}
                className={classNames(
                  "w-full h-full",
                  "rounded-[2.5rem]",
                  "border border-brand-light/5",
                  [
                    "brandbg-large-modal",
                    "after:absolute after:inset-0",
                    "after:shadow-addaccountmodal",
                    "after:rounded-[2.5rem]",
                    "after:pointer-events-none",
                    "after:z-20",
                  ]
                )}
                scrollBarClassName={classNames(
                  "pt-[4.25rem]",
                  "!right-1",
                  "pb-[3.25rem]"
                )}
                type="scroll"
              >
                <Dialog.Close className="absolute top-4 right-4" asChild>
                  <Button theme="clean">Cancel</Button>
                </Dialog.Close>

                <Suspense fallback={null}>
                  {activityOpened && <ActivityContent />}
                </Suspense>
              </ScrollAreaContainer>
            )}
          </OverflowProvider>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
});

export default ActivityModal;

const ActivityContent = memo(() => {
  const [delayFinished, setDelayFinished] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setDelayFinished(true), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className={classNames(
        "w-[66.25rem] mx-auto h-full pt-16 flex flex-col",
        !delayFinished ? "hidden" : "animate-bootfadeinfast"
      )}
    >
      <Approve />
      <History />
    </div>
  );
});

const Approve = memo(() => {
  const approvalStatus = useAtomValue(approvalStatusAtom);

  const handleApprove = useCallback(() => {
    browser.runtime.sendMessage("__OPEN_APPROVE_WINDOW");
  }, []);

  return (
    <>
      {approvalStatus.total > 0 && (
        <div
          className={classNames(
            "w-full h-14 mb-10",
            "border border-brand-inactivedark/25",
            "animate-pulse hover:animate-none",
            "rounded-2xl",
            "flex items-center",
            "py-2.5 px-5"
          )}
        >
          <ApprovalStatus readOnly theme="large" />
          <div className="flex-1" />

          <button
            type="button"
            className={classNames(
              "mr-2",
              "px-2 py-1",
              "!text-sm text-brand-inactivelight hover:text-brand-light",
              "transition-colors",
              "font-semibold"
            )}
            onClick={() => rejectAllApprovals()}
          >
            Reject all
          </button>

          <Button className="!py-2 !text-sm" onClick={handleApprove}>
            Approve
            <LinkIcon className="ml-1 w-4 h-4 min-w-[1rem]" />
          </Button>
        </div>
      )}
    </>
  );
});

const History = memo(() => {
  const pendingActivity = useLazyAtomValue(pendingActivityAtom);
  const {
    activity: completeActivity,
    hasMore,
    loadMore,
  } = useCompleteActivity();

  const observer = useRef<IntersectionObserver>();
  const loadMoreTriggerRef = useCallback(
    (node) => {
      if (!completeActivity) return;

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
    [completeActivity, hasMore, loadMore]
  );

  return (
    <>
      {pendingActivity && pendingActivity?.length > 0 && (
        <div className="mb-8">
          <SectionHeader className="mb-6">Pending</SectionHeader>

          {pendingActivity.map((item) => (
            <ActivityCard key={item.id} item={item} className="mb-4" />
          ))}
        </div>
      )}

      {completeActivity && completeActivity?.length > 0 && (
        <div className="mb-8">
          <SectionHeader className="mb-6">Completed</SectionHeader>

          {completeActivity.map((item, i) => (
            <ActivityCard
              key={item.id}
              ref={
                i ===
                completeActivity.length - LOAD_MORE_ON_ACTIVITY_FROM_END - 1
                  ? loadMoreTriggerRef
                  : null
              }
              item={item}
              className="mb-4"
            />
          ))}
        </div>
      )}

      {pendingActivity &&
        completeActivity &&
        pendingActivity.length === 0 &&
        completeActivity.length === 0 && (
          <div className="w-full min-h-[30rem] flex flex-col items-center justify-center">
            <NoResultsFoundIcon className="w-[30rem] h-auto mb-8" />
            <h3 className="text-2xl text-brand-inactivedark font-bold">
              No activity yet
            </h3>
          </div>
        )}
    </>
  );
});

type StatusType = "succeeded" | "failed" | "skipped" | "revoked";

type ActivityCardProps = {
  item: Activity;
  className?: string;
};

const ActivityCard = memo(
  forwardRef<HTMLDivElement, ActivityCardProps>(({ item, className }, ref) => {
    const [revokedPermission, setRevokedPermission] = useSafeState(false);

    const status = useMemo<StatusType | undefined>(() => {
      if (item.type === ActivityType.Connection && revokedPermission) {
        return "revoked";
      }

      if (item.type !== ActivityType.Transaction || item.pending) {
        return;
      }

      if (!item.result) {
        return "skipped";
      }

      if (
        item.result.status &&
        ethers.BigNumber.from(item.result.status).isZero()
      ) {
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

      const parsedTx = ethers.utils.parseTransaction(item.rawTx);

      const native = ethers.BigNumber.from(item.result.gasUsed)
        .mul(
          item.result.effectiveGasPrice ??
            parsedTx.maxFeePerGas ??
            parsedTx.gasPrice
        )
        .toString();

      return {
        native,
        fiat:
          item.gasTokenPriceUSD &&
          new BigNumber(ethers.utils.formatEther(native)).times(
            item.gasTokenPriceUSD
          ),
      };
    }, [item]);

    return (
      <div
        ref={ref}
        className={classNames(
          "w-full",
          "bg-brand-inactivelight/5",
          "border",
          item.pending && "border-[#D99E2E]/50",
          item.pending && "animate-pulse",
          (!status || status === "succeeded" || status === "revoked") &&
            !item.pending &&
            "border-brand-inactivedark/25",
          status === "failed" && "border-brand-redobject/50",
          status === "skipped" && "border-brand-main/50",
          "rounded-2xl",
          "flex items-center",
          "py-3 px-5",
          className
        )}
      >
        <ActivityIcon item={item} className="mr-6" />

        <ActivityTypeLabel
          item={item}
          status={status}
          className="w-[10rem] mr-8"
        />

        {(item.type === ActivityType.Transaction ||
          item.type === ActivityType.Signing) && (
          <ActivityWalletCard
            accountAddress={item.accountAddress}
            className="w-[10rem] mr-8"
          />
        )}

        {item.type === ActivityType.Transaction && (
          <ActivityNetworkCard
            chainId={item.chainId}
            fee={fee}
            className="w-[12rem] mr-8"
          />
        )}

        {item.source.type === "page" && (
          <ActivityWebsiteLink
            source={item.source}
            className="w-[10rem] mr-8"
          />
        )}

        {item.type === ActivityType.Connection && (
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
              className="w-[10rem] mr-8"
            />
          </ChainIdProvider>
        )}

        <div className="flex flex-col items-end ml-auto">
          {item.type === ActivityType.Transaction && (
            <ChainIdProvider chainId={item.chainId}>
              <ActivityTxActions item={item} className="mb-1" />
            </ChainIdProvider>
          )}

          <div className="text-xs text-brand-inactivedark">
            <PrettyDate date={item.timeAt} />
          </div>
        </div>
      </div>
    );
  })
);

type DisconnectDAppProps = {
  item: ConnectionActivity;
  setRevokedPermission: (r: true) => void;
  className?: string;
};

const DisconnectDApp = memo<DisconnectDAppProps>(
  ({ item, className, setRevokedPermission }) => {
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
            "px-2 py-0.5",
            "text-xs text-brand-inactivelight",
            "transition-colors",
            "hover:bg-brand-main/10"
          )}
          onClick={handleDisconnect}
        >
          Revoke permission
        </button>
      </div>
    );
  }
);

type ActivityIconProps = {
  item: Activity;
  className?: string;
};

const ActivityIcon = memo<ActivityIconProps>(({ item, className }) => {
  return item.source.type === "page" ? (
    <Avatar
      src={item.source.favIconUrl}
      alt={item.source.url}
      className={classNames(
        "block",
        "bg-white",
        "rounded-full overflow-hidden",
        "w-12 h-12 min-w-[3rem]",
        className
      )}
      fallbackClassName="!h-3/5"
    />
  ) : (
    <SendIcon
      className={classNames("glass-icon--active", "w-12 h-12", className)}
    />
  );
});

type ActivityTypeLabelProps = {
  item: Activity;
  status?: StatusType;
  className?: string;
};

const ActivityTypeLabel: FC<ActivityTypeLabelProps> = ({
  item,
  status,
  className,
}) => {
  const name =
    item.type === ActivityType.Transaction && item.source.type === "self"
      ? "Transfer"
      : item.type;

  const Icon = getActivityIcon(item.type);
  const label = (
    <div
      className={classNames(
        "flex items-center",
        "text-base text-brand-inactivelight font-medium",
        status ? "" : className
      )}
    >
      <Icon className="w-5 h-auto mr-2" />
      {capitalize(name)}
    </div>
  );
  if (!status) {
    return label;
  }

  return (
    <div className={classNames("flex flex-col", className)}>
      {label}
      <div
        className={classNames(
          "mt-0.5 ml-7",
          "text-xs font-medium",
          status === "succeeded" && "text-brand-greenobject",
          status === "failed" && "text-brand-redtext",
          status === "skipped" && "text-brand-main",
          status === "revoked" && "text-brand-inactivedark"
        )}
      >
        {capitalize(status === "succeeded" ? "success" : status)}
      </div>
    </div>
  );
};

const getActivityIcon = (type: ActivityType) => {
  switch (type) {
    case ActivityType.Connection:
      return ActivityConnectionIcon;
    case ActivityType.Signing:
      return ActivitySigningIcon;
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
        "hover:underline",
        "inline-flex items-center",
        className
      )}
    >
      <span className="min-w-0 truncate text-base">
        {new URL(source.url).host}
      </span>
      <LinkIcon className="ml-1 w-5 h-5 min-w-[1.25rem]" />
    </button>
  );
};

type ActivityWalletCardProps = {
  accountAddress: string;
  className?: string;
};

const ActivityWalletCard: FC<ActivityWalletCardProps> = ({
  accountAddress,
  className,
}) => {
  const allAccounts = useAtomValue(allAccountsAtom);
  const account = useMemo(
    () => allAccounts.find((acc) => acc.address === accountAddress),
    [allAccounts, accountAddress]
  );

  return account ? (
    <div
      className={classNames(
        "relative",
        "flex items-stretch",
        "text-left",
        className
      )}
    >
      <AutoIcon
        seed={account.address}
        source="dicebear"
        type="personas"
        className={classNames(
          "h-9 w-9 min-w-[2.25rem]",
          "mr-2",
          "bg-black/20",
          "rounded-md"
        )}
      />
      <span
        className={classNames(
          "flex flex-col items-start justify-center",
          "min-w-0"
        )}
      >
        <WalletName wallet={account} theme="small" className="text-sm" />
        <HashPreview
          hash={account.address}
          className="leading-none text-brand-inactivedark text-sm"
        />
      </span>
    </div>
  ) : (
    <span
      className={classNames(
        "font-medium text-brand-inactivedark text-base",
        className
      )}
    >
      Deleted
    </span>
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
  const network = useLazyAtomValue(getNetworkAtom(chainId));

  const label = (
    <div
      className={classNames(
        "flex items-center",
        "min-h-[1.5rem]",
        fee ? "" : className
      )}
    >
      {network && (
        <Avatar
          src={network && getNetworkIconUrl(network.chainId)}
          alt={network?.name}
          withBorder={false}
          className="w-6 mr-2 min-w-[1.5rem]"
        />
      )}

      <span className="truncate min-w-0 text-base">{network?.name}</span>
    </div>
  );

  if (!fee) {
    return label;
  }

  return (
    <div className={classNames("flex flex-col", className)}>
      {label}
      <span className="flex items-center text-brand-inactivedark ml-8 mt-1">
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
  item: TransactionActivity;
  className?: string;
};

const ActivityTxActions: FC<ActivityTxActionsProps> = ({ item, className }) => {
  const network = useLazyNetwork();
  const explorerLink = useExplorerLink(network);

  const { copy, copied } = useCopyToClipboard(item.txHash);

  return (
    <div className={classNames("flex items-center", className)}>
      <IconedButton
        aria-label={copied ? "Copied" : "Copy transaction hash"}
        Icon={copied ? SuccessIcon : CopyIcon}
        className="!w-6 !h-6 min-w-[1.5rem]"
        iconClassName="!w-[1.125rem]"
        onClick={copy}
      />
      {explorerLink && (
        <IconedButton
          aria-label="View the transaction in Explorer"
          Icon={WalletExplorerIcon}
          className="!w-6 !h-6 min-w-[1.5rem] ml-2"
          iconClassName="!w-[1.125rem]"
          href={explorerLink.tx(item.txHash)}
        />
      )}
    </div>
  );
};

const SectionHeader: FC<{ className?: string }> = memo(
  ({ className, children }) => (
    <div className={classNames("w-full", className)}>
      <h1 className={"text-2xl font-bold"}>{children}</h1>
    </div>
  )
);

type ActivityTokensProps = {
  source: ActivitySource;
  action?: TxAction;
  accountAddress: string;
  className?: string;
};

const ActivityTokens = memo<ActivityTokensProps>(
  ({ source, action, accountAddress, className }) => {
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
          />
        ))}
      </div>
    );
  }
);

function capitalize(word: string) {
  const lower = word.toLowerCase();
  return `${word.charAt(0).toUpperCase()}${lower.slice(1)}`;
}
