import { FC, useCallback, useState } from "react";
import classNames from "clsx";
import { match } from "ts-pattern";
import browser from "webextension-polyfill";
import { useAtom, useAtomValue } from "jotai";

import { activityModalAtom, approvalStatusAtom } from "app/atoms";
import { TippySingletonProvider } from "app/hooks";
import { openInTab } from "app/helpers";

import ApprovalStatus from "app/components/blocks/ApprovalStatus";
import Tooltip from "app/components/elements/Tooltip";
import { ReactComponent as ActivityHoverIcon } from "app/icons/external-link.svg";
import { ReactComponent as SuccessIcon } from "app/icons/activity-successfull.svg";
import { ReactComponent as PendingIcon } from "app/icons/activity-pending.svg";
import { ReactComponent as FailedIcon } from "app/icons/activity-warning.svg";

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

  const [activityHovered, setActivityHovered] = useState(false);

  const handleClick = useCallback(async () => {
    if (total > 0) {
      browser.runtime.sendMessage("__OPEN_APPROVE_WINDOW");
    } else if (theme === "small") {
      openInTab({ activityOpened: true }, ["token"]);
    }

    if (theme === "large") {
      setActivityOpened([true, "replace"]);
    }
  }, [theme, total, setActivityOpened]);

  return (
    <div
      className={classNames(
        "fixed bottom-3 left-1/2 -translate-x-1/2",
        "transition-transform duration-300",
        activityOpened && "!translate-y-[120%]",
        "w-[calc(100%-1.5rem)] max-w-[75rem]",
        "bg-brand-darkblue/20",
        "backdrop-blur-[10px]",
        "border border-brand-main/[.05]",
        "shadow-addaccountmodal",
        "flex justify-between",
        "rounded-[.625rem]",
        "cursor-pointer select-none",
        bootAnimationDisplayed &&
          !activityOpened &&
          "animate-activitybar translate-y-[120%]",
        theme === "large" && "px-8 py-4",
        theme === "small" && "px-3 py-2"
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
              theme === "small" && "w-20 h-1.5",
              theme === "large" && "w-52 h-2",
              activityHovered && "!h-0",
              centeredClassNames
            )}
          />
          <span
            className={classNames(
              "transition-opacity",
              "whitespace-nowrap",
              "flex items-center",
              "font-bold",
              theme === "small" && "text-xs",
              theme === "large" && "text-base",
              !activityHovered && "opacity-0",
              centeredClassNames
            )}
          >
            {total > 0 ? (
              <>
                {theme === "large" ? "Open and Approve" : "Approve"}
                <ActivityHoverIcon
                  className={classNames(
                    "ml-1",
                    theme === "small" && "w-[1.125rem] h-[1.125rem]",
                    theme === "large" && "w-5 h-5"
                  )}
                />
              </>
            ) : theme === "large" ? (
              "Click to open"
            ) : (
              <>
                Activity
                <ActivityHoverIcon
                  className={classNames(
                    "ml-1",
                    theme === "small" && "w-[1.125rem] h-[1.125rem]"
                  )}
                />
              </>
            )}
          </span>
        </div>
        <div className="flex items-center invisible">
          <StatItem
            count={2}
            ariaLabel="2 successful transactions"
            theme={theme}
            className={classNames(
              theme === "small" && "mr-2",
              theme === "large" && "mr-6"
            )}
          />
          <StatItem
            count={4}
            status="pending"
            ariaLabel="4 pending transactions"
            theme={theme}
            className={classNames(
              theme === "small" && "mr-2",
              theme === "large" && "mr-6"
            )}
          />
          <StatItem
            count={1}
            status="failed"
            ariaLabel="1 failed transactions"
            theme={theme}
          />
        </div>
      </TippySingletonProvider>
    </div>
  );
};

export default ActivityBar;

const centeredClassNames = classNames(
  "absolute",
  "top-1/2 left-1/2",
  "-translate-x-1/2 -translate-y-1/2"
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
        theme === "small" && "text-xs",
        theme === "large" && "text-base",
        color,
        className
      )}
    >
      <>
        <Icon
          className={classNames(
            theme === "small" && "w-[1.125rem] h-[1.125rem] mr-1",
            theme === "large" && "w-5 h-auto mr-2"
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
