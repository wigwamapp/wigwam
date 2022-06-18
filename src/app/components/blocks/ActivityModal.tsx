import { FC, memo, ReactNode, Suspense, useCallback, useMemo } from "react";
import classNames from "clsx";
import * as Dialog from "@radix-ui/react-dialog";
import { useAtom, useAtomValue } from "jotai";
import browser from "webextension-polyfill";
import { useLazyAtomValue } from "lib/atom-utils";
import { useIsMounted } from "lib/react-hooks/useIsMounted";

import { getNetworkIconUrl } from "fixtures/networks";
import {
  Activity,
  ActivitySource,
  ActivityType,
  TransactionActivity,
} from "core/types";

import {
  activityModalAtom,
  allAccountsAtom,
  approvalStatusAtom,
  getActivityAtom,
  getNetworkAtom,
  pendingActivityAtom,
} from "app/atoms";
import { OverflowProvider } from "app/hooks";
import { openInTabExternal } from "app/utils";
import { ReactComponent as SendIcon } from "app/icons/Send-activity.svg";
import { ReactComponent as LinkIcon } from "app/icons/external-link.svg";
import { ReactComponent as SuccessIcon } from "app/icons/success.svg";
import { ReactComponent as CopyIcon } from "app/icons/copy.svg";
import { ReactComponent as WalletExplorerIcon } from "app/icons/external-link.svg";

import Button from "../elements/Button";
import ScrollAreaContainer from "../elements/ScrollAreaContainer";
import Avatar from "../elements/Avatar";
import AutoIcon from "../elements/AutoIcon";
import WalletName from "../elements/WalletName";
import HashPreview from "../elements/HashPreview";
import PrettyDate from "../elements/PrettyDate";
import IconedButton from "../elements/IconedButton";
import { useCopyToClipboard } from "lib/react-hooks/useCopyToClipboard";
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
                  "pb-28"
                )}
                type="scroll"
              >
                <Dialog.Close className="absolute top-4 right-4" asChild>
                  <Button theme="clean">Cancel</Button>
                </Dialog.Close>

                <Suspense fallback={null}>
                  <ActivityContent />
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
  const approvalStatus = useAtomValue(approvalStatusAtom);

  const pendingActivities = useLazyAtomValue(pendingActivityAtom);
  const completeActivities = useLazyAtomValue(getActivityAtom({}));

  const handleApprove = useCallback(() => {
    browser.runtime.sendMessage("__OPEN_APPROVE_WINDOW");
  }, []);

  return (
    <div className="w-[59rem] mx-auto h-full pt-16 flex flex-col">
      {approvalStatus.total > 0 && (
        <div
          className={classNames(
            "w-full h-20 mb-8",
            "border border-brand-inactivedark/25 animate-pulse",
            "rounded-2xl",
            "flex items-center",
            "py-3 px-6"
          )}
        >
          <ApprovalStatus readOnly theme="large" />
          <div className="flex-1" />
          <Button className="!py-2" onClick={handleApprove}>
            Approve
            <LinkIcon className="ml-1 w-4 h-4 min-w-[1rem]" />
          </Button>
        </div>
      )}

      {pendingActivities && pendingActivities?.length > 0 && (
        <div className="mb-8">
          <SectionHeader className="mb-6">Pending</SectionHeader>

          {pendingActivities.map((item) => (
            <ActivityCard key={item.id} item={item} className="mb-4" />
          ))}
        </div>
      )}

      {completeActivities && completeActivities?.length > 0 && (
        <div className="mb-8">
          <SectionHeader className="mb-6">Complete</SectionHeader>

          {completeActivities.map((item) => (
            <ActivityCard key={item.id} item={item} className="mb-4" />
          ))}
        </div>
      )}

      {pendingActivities &&
        completeActivities &&
        pendingActivities.length === 0 &&
        completeActivities.length === 0 && (
          <div className="w-full min-h-[30rem] flex flex-col items-center justify-center">
            <h3 className="text-2xl text-brand-inactivedark">
              No activity yet
            </h3>
          </div>
        )}
    </div>
  );
});

type ActivityCardProps = {
  item: Activity;
  className?: string;
};

const ActivityCard = memo<ActivityCardProps>(({ item, className }) => {
  return (
    <div
      className={classNames(
        "w-full h-20",
        "bg-brand-inactivelight/5",
        "border",
        item.pending ? "border-[#D99E2E]/50" : "border-brand-inactivedark/25",
        item.pending && "animate-pulse",
        "rounded-2xl",
        "flex items-center",
        "py-3 px-6",
        className
      )}
    >
      <ActivityIcon item={item} className="mr-6" />

      <ActivityCardCol label="Type" className="w-[6rem] mr-8">
        <div
          className={classNames(
            "text-sm font-semibold text-brand-inactivelight"
          )}
        >
          {capitalize(item.type)}
        </div>
      </ActivityCardCol>

      {item.source.type === "page" && (
        <ActivityCardCol label="Website" className="w-[10rem] mr-8">
          <ActivityWebsiteLink source={item.source} />
        </ActivityCardCol>
      )}

      {(item.type === ActivityType.Transaction ||
        item.type === ActivityType.Signing) && (
        <ActivityCardCol label="Wallet" className="w-[10rem] mr-8">
          <ActivityWalletCard accountAddress={item.accountAddress} />
        </ActivityCardCol>
      )}

      {item.type === ActivityType.Transaction && (
        <ActivityCardCol label="Network" className="w-[10rem] mr-8">
          <ActivityNetworkCard chainId={item.chainId} />
        </ActivityCardCol>
      )}

      <div className={classNames("flex-1 h-full", "flex flex-col items-end")}>
        <div className="flex-1 flex items-center">
          {item.type === ActivityType.Transaction && (
            <ActivityTxActions item={item} />
          )}
        </div>

        <div className="text-xs mt-1 text-brand-inactivedark">
          <PrettyDate date={item.timeAt} />
        </div>
      </div>
    </div>
  );
});

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
        "w-10 h-10",
        className
      )}
      fallbackClassName="!h-3/5"
    />
  ) : (
    <SendIcon
      className={classNames("glass-icon--active", "w-10 h-10", className)}
    />
  );
});

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
      <span className="min-w-0 truncate text-sm">
        {new URL(source.url).host}
      </span>
      <LinkIcon className="ml-1 w-4 h-4 min-w-[1rem]" />
    </button>
  );
};

type ActivityWalletCardProps = {
  accountAddress: string;
};

const ActivityWalletCard: FC<ActivityWalletCardProps> = ({
  accountAddress,
}) => {
  const allAccounts = useAtomValue(allAccountsAtom);
  const account = useMemo(
    () => allAccounts.find((acc) => acc.address === accountAddress),
    [allAccounts, accountAddress]
  );

  return account ? (
    <div className={classNames("relative", "flex items-stretch", "text-left")}>
      <AutoIcon
        seed={account.address}
        source="dicebear"
        type="personas"
        className={classNames(
          "h-8 w-8 min-w-[2rem]",
          "mr-2",
          "bg-black/20",
          "rounded-md"
        )}
      />
      <span
        className={classNames(
          "flex flex-col items-start justify-center",
          "min-w-0 text-xs leading-none"
        )}
      >
        <WalletName wallet={account} theme="small" className="mb-1" />
        <HashPreview
          hash={account.address}
          className="text-xs leading-none text-brand-inactivedark"
        />
      </span>
    </div>
  ) : (
    <span className="font-medium text-brand-inactivedark text-base">
      Deleted
    </span>
  );
};

type ActivityNetworkCardProps = {
  chainId: number;
};

const ActivityNetworkCard: FC<ActivityNetworkCardProps> = ({ chainId }) => {
  const network = useLazyAtomValue(getNetworkAtom(chainId));

  return (
    <div className="flex items-center">
      {network && (
        <Avatar
          src={network && getNetworkIconUrl(network.chainId)}
          alt={network?.name}
          withBorder={false}
          className="w-6 mr-2 min-w-[1.5rem]"
        />
      )}

      <span className="truncate min-w-0">{network?.name}</span>
    </div>
  );
};

type ActivityTxActionsProps = {
  item: TransactionActivity;
};

const ActivityTxActions: FC<ActivityTxActionsProps> = ({ item }) => {
  const network = useLazyAtomValue(getNetworkAtom(item.chainId));
  const explorerUrl = network?.explorerUrls?.[0];

  const { copy, copied } = useCopyToClipboard(item.txHash);

  return (
    <div className="flex items-center">
      <IconedButton
        aria-label={copied ? "Copied" : "Copy transaction hash"}
        Icon={copied ? SuccessIcon : CopyIcon}
        className="!w-6 !h-6 min-w-[1.5rem]"
        iconClassName="!w-[1.125rem]"
        onClick={copy}
      />
      {explorerUrl && (
        <IconedButton
          aria-label="View transaction in Explorer"
          Icon={WalletExplorerIcon}
          className="!w-6 !h-6 min-w-[1.5rem] ml-2"
          iconClassName="!w-[1.125rem]"
          href={`${explorerUrl}/tx/${item.txHash}`}
        />
      )}
    </div>
  );
};

type ActivityCardColProps = {
  className?: string;
  label: ReactNode;
};

const ActivityCardCol: FC<ActivityCardColProps> = ({
  className,
  label,
  children,
}) => (
  <div
    className={classNames(
      "h-full flex flex-col items-start",
      "overflow-hidden",
      className
    )}
  >
    <span className="mb-1 text-xs font-medium text-brand-inactivedark/75">
      {label}
    </span>

    <div className="flex-1 flex items-center text-brand-light">{children}</div>
  </div>
);

const SectionHeader: FC<{ className?: string }> = memo(
  ({ className, children }) => (
    <div className={classNames("w-full", className)}>
      <h1 className={"text-2xl font-bold"}>{children}</h1>
    </div>
  )
);

function capitalize(word: string) {
  const lower = word.toLowerCase();
  return `${word.charAt(0).toUpperCase()}${lower.slice(1)}`;
}
