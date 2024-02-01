import { FC, useCallback, useState } from "react";
import classNames from "clsx";
import { match } from "ts-pattern";
import browser from "webextension-polyfill";
import { useAtom, useAtomValue } from "jotai";
import { useLazyAtomValue } from "lib/atom-utils";

import { IS_FIREFOX } from "app/defaults";
import {
  activityModalAtom,
  approvalStatusAtom,
  getPendingActivitiesAtom,
} from "app/atoms";
import { TippySingletonProvider, useAccounts } from "app/hooks";

import ApprovalStatus from "app/components/blocks/ApprovalStatus";
import Tooltip from "app/components/elements/Tooltip";
import { ReactComponent as ActivityHoverIcon } from "app/icons/external-link.svg";
import { ReactComponent as ArrowIcon } from "app/icons/arrow-up.svg";
import { ReactComponent as SuccessIcon } from "app/icons/activity-successfull.svg";
import { ReactComponent as PendingIcon } from "app/icons/activity-pending.svg";
import { ReactComponent as FailedIcon } from "app/icons/warning.svg";

type WithThemeProps = {
  theme?: "small" | "large";
};

let bootAnimationDisplayed = true;
const handleAnimationEnd = () => {
  bootAnimationDisplayed = false;
};

const ActivityBar: FC<WithThemeProps> = ({ theme = "large" }) => {
  const { total } = useAtomValue(approvalStatusAtom);
  const [activityOpened, setActivityOpened] = useAtom(activityModalAtom);

  const { currentAccount } = useAccounts();
  const pendingActivities = useLazyAtomValue(
    getPendingActivitiesAtom(currentAccount.address),
  );
  const pendingCount = pendingActivities?.length ?? 0;

  const [activityHovered, setActivityHovered] = useState(false);

  const handleClick = useCallback(async () => {
    if (total > 0) {
      browser.runtime.sendMessage("__OPEN_APPROVE_WINDOW");
    }

    setActivityOpened([true, "replace"]);
  }, [total, setActivityOpened]);

  return (
    <div
      className={classNames(
        "fixed bottom-3 left-1/2 -translate-x-1/2",
        "transition-transform duration-300",
        activityOpened && "!translate-y-[120%]",
        "w-[calc(100%-1.5rem)] max-w-[75rem]",
        "bg-brand-darkblue/20",
        "backdrop-blur-[10px]",
        IS_FIREFOX && "!bg-[#0E1314]/[.95]",
        "border border-brand-main/[.05]",
        "shadow-addaccountmodal",
        "flex justify-between",
        "rounded-[.625rem]",
        "cursor-pointer select-none",
        bootAnimationDisplayed &&
          !activityOpened &&
          "animate-activitybar translate-y-[120%]",
        theme === "large" &&
          "px-8 py-4 mmd:px-6 mmd:py-3 mmd:h-[3rem] mxs:px-3 mxs:py-2 mxs:h-[2.25rem]",
        theme === "small" && "h-[2.25rem] px-3 py-2",
      )}
      onAnimationEnd={handleAnimationEnd}
      onMouseOver={() => setActivityHovered(true)}
      onFocus={() => setActivityHovered(true)}
      onMouseLeave={() => setActivityHovered(false)}
      onBlur={() => setActivityHovered(true)}
      onClick={handleClick}
      role="presentation"
    >
      <TippySingletonProvider>
        <ApprovalStatus theme={theme} />

        <div className={centeredClassNames}>
          <span
            className={classNames(
              "bg-activity",
              "rounded-xl",
              "transition-all",
              theme === "large" && "w-52 h-2 mmd:w-40 mxs:w-20 mxs:h-1.5",
              theme === "small" && "w-20 h-1.5",
              activityHovered && "!h-0",
              centeredClassNames,
            )}
          />
          <span
            className={classNames(
              "transition-opacity",
              "whitespace-nowrap",
              "flex items-center",
              "font-bold",
              theme === "large" && "text-base mmd:text-sm mxs:text-xs",
              theme === "small" && "text-xs",
              !activityHovered && "opacity-0",
              centeredClassNames,
            )}
          >
            {total > 0 ? (
              <>
                {theme === "large" ? (
                  <>
                    <span>
                      <span className="mxs:hidden">Open and </span>Approve
                    </span>
                  </>
                ) : (
                  "Approve"
                )}
                <ActivityHoverIcon
                  className={classNames(
                    "ml-1",
                    theme === "large" &&
                      "w-5 h-5 mxs:w-[1.125rem] mxs:h-[1.125rem]",
                    theme === "small" && "w-[1.125rem] h-[1.125rem]",
                  )}
                />
              </>
            ) : theme === "large" ? (
              <>
                <span className="mxs:hidden">Click to open</span>
                <span className="hidden mxs:flex mxs:items-center">
                  Activity
                  <ArrowIcon
                    className={classNames("w-[1.125rem] h-[1.125rem]")}
                  />
                </span>
              </>
            ) : (
              <>
                Activity
                <ArrowIcon
                  className={classNames(
                    "ml-1",
                    "w-6 h-6",
                    "mmd:w-5 mmd:h-5",
                    "mxs:w-[1.125rem] mxs:h-[1.125rem]",
                    theme === "small" && "w-[1.125rem] h-[1.125rem]",
                  )}
                />
              </>
            )}
          </span>
        </div>
        <div className="flex items-center">
          {/* <StatItem
            count={2}
            ariaLabel="2 successful transactions"
            theme={theme}
            className={classNames(
              theme === "small" && "mr-2",
              theme === "large" && "mr-6"
            )}
          /> */}
          {pendingCount > 0 && (
            <StatItem
              count={pendingCount}
              status="pending"
              ariaLabel={`${pendingCount} pending transactions`}
              theme={theme}
            />
          )}

          {/* <StatItem
            count={1}
            status="failed"
            ariaLabel="1 failed transactions"
            theme={theme}
          /> */}
        </div>
      </TippySingletonProvider>
    </div>
  );
};

export default ActivityBar;

const centeredClassNames = classNames(
  "absolute",
  "top-1/2 left-1/2",
  "-translate-x-1/2 -translate-y-1/2",
);

type StatusType = "successful" | "pending" | "failed";

type StatItemProps = WithThemeProps & {
  status?: StatusType;
  count?: number;
  ariaLabel: string;
  className?: string;
};

const StatItem: FC<StatItemProps> = ({
  status = "successful",
  count,
  ariaLabel,
  theme,
  className,
}) => {
  if (!count || count === 0) {
    return <></>;
  }

  const { Icon, color } = getStatConfig(status);

  return (
    <Tooltip
      content={ariaLabel}
      className={classNames(
        "flex items-center",
        "font-bold",
        theme === "large" && "text-base mmd:text-sm mxs:text-xs",
        theme === "small" && "text-xs",
        color,
        className,
      )}
    >
      <>
        <Icon
          className={classNames(
            theme === "large" &&
              "w-5 h-auto mr-2 mxs:w-[1.125rem] mxs:h-[1.125rem] mxs:mr-1",
            theme === "small" && "w-[1.125rem] h-[1.125rem] mr-1",
          )}
        />
        {count}
      </>
    </Tooltip>
  );
};

const getStatConfig = (status: StatusType) =>
  match(status)
    .with("pending", () => ({ Icon: PendingIcon, color: "text-[#D99E2E]" }))
    .with("failed", () => ({ Icon: FailedIcon, color: "text-[#EA556A]" }))
    .otherwise(() => ({ Icon: SuccessIcon, color: "text-[#6BB77A]" }));
