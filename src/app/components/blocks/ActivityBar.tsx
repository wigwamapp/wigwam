import { FC, ReactElement, useState } from "react";
import { match } from "ts-pattern";
import classNames from "clsx";

import { TippySingletonProvider } from "app/hooks";
import Tooltip from "app/components/elements/Tooltip";
import Avatar from "app/components/elements/Avatar";
import { ReactComponent as ActivityHoverIcon } from "app/icons/external-link.svg";
import { ReactComponent as SendIcon } from "app/icons/Send.svg";
import { ReactComponent as SwapIcon } from "app/icons/SwapIcon.svg";
import { ReactComponent as ArrowIcon } from "app/icons/arrow-up.svg";
import { ReactComponent as SuccessIcon } from "app/icons/activity-successfull.svg";
import { ReactComponent as PendingIcon } from "app/icons/activity-pending.svg";
import { ReactComponent as FailedIcon } from "app/icons/activity-warning.svg";

type WithThemeProps = {
  theme?: "small" | "large";
};

const ActivityBar: FC<WithThemeProps> = ({ theme = "large" }) => {
  const [activityHovered, setActivityHovered] = useState(false);

  return (
    <div
      className={classNames(
        "fixed bottom-3 left-1/2 -translate-x-1/2",
        "w-[calc(100%-1.5rem)] max-w-[75rem]",
        "bg-brand-darkblue/20",
        "backdrop-blur-[10px]",
        "border border-brand-main/[.05]",
        "shadow-addaccountmodal",
        "flex justify-between",
        "rounded-[.625rem]",
        "cursor-pointer",
        theme === "large" && "px-8 py-4",
        theme === "small" && "px-3 py-2"
      )}
      onMouseOver={() => setActivityHovered(true)}
      onFocus={() => setActivityHovered(true)}
      onMouseLeave={() => setActivityHovered(false)}
      onBlur={() => setActivityHovered(true)}
    >
      <TippySingletonProvider>
        <div className="flex items-center">
          <ActivityIcon
            Icon={SendIcon}
            ariaLabel="Transfer transaction"
            theme={theme}
            className="mr-2"
          />
          <ActivityIcon
            Icon={SwapIcon}
            ariaLabel="Swap transaction"
            theme={theme}
            className="mr-2"
          />
          <ActivityIcon
            Icon="data:image/png;base64,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"
            ariaLabel="Approve interaction with compound.finance"
            theme={theme}
          />
          <span
            className={classNames(
              "flex items-center",
              "font-bold",
              "ml-2",
              theme === "small" && "text-xs",
              theme === "large" && "text-base"
            )}
          >
            +3
            {theme === "large" && (
              <>
                {" "}
                waiting for approval
                <ArrowIcon className="ml-1" />
              </>
            )}
          </span>
        </div>
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
            Coming soon
            <ActivityHoverIcon
              className={classNames(
                "ml-1",
                theme === "small" && "w-[1.125rem] h-[1.125rem]",
                theme === "large" && "w-5 h-5"
              )}
            />
          </span>
        </div>
        <div className="flex items-center">
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

type ActivityIconProps = WithThemeProps & {
  Icon: FC<{ className?: string }> | string;
  ariaLabel?: string;
  className?: string;
};

const ActivityIcon: FC<ActivityIconProps> = ({
  theme,
  Icon,
  ariaLabel,
  className,
}) => {
  let content: ReactElement;

  if (typeof Icon === "string") {
    content = (
      <Avatar
        src={Icon}
        alt={ariaLabel}
        className={classNames(
          "block",
          "bg-white",
          "rounded-full overflow-hidden",
          theme === "small" && "w-[1.125rem] h-[1.125rem]",
          theme === "large" && "w-6 h-6",
          className
        )}
      />
    );
  } else {
    content = (
      <Icon
        className={classNames(
          "glass-icon-stable",
          theme === "small" && "w-[1.125rem] h-[1.125rem]",
          theme === "large" && "w-6 h-6",
          className
        )}
      />
    );
  }

  if (ariaLabel) {
    return <Tooltip content={ariaLabel}>{content}</Tooltip>;
  }

  return (
    <Icon
      className={classNames(
        theme === "small" && "w-[1.125rem] h-[1.125rem]",
        theme === "large" && "w-6 h-6",
        className
      )}
    />
  );
};

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
