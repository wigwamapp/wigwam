import { FC, ReactElement, useState } from "react";
import { match } from "ts-pattern";
import classNames from "clsx";

import Tooltip from "app/components/elements/Tooltip";
import { ReactComponent as ActivityHoverIcon } from "app/icons/external-link.svg";
import { ReactComponent as SendIcon } from "app/icons/Send.svg";
import { ReactComponent as SwapIcon } from "app/icons/Send.svg";
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
          Icon="https://s2.coinmarketcap.com/static/img/coins/200x200/7278.png"
          ariaLabel="Approve interaction with aave.com"
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
      <span
        className={classNames(
          "block",
          "bg-white",
          "rounded-full overflow-hidden",
          theme === "small" && "w-[1.125rem] h-[1.125rem]",
          theme === "large" && "w-6 h-6",
          className
        )}
      >
        <img
          src={Icon}
          alt={ariaLabel}
          className="w-full h-full object-cover"
        />
      </span>
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
    return (
      <Tooltip content={ariaLabel} size="small" duration={[100, 0]}>
        {content}
      </Tooltip>
    );
  }

  return <Icon />;
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
      size="small"
      duration={[100, 0]}
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
            theme === "large" && "mr-2"
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
