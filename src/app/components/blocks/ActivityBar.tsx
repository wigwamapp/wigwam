import { FC, ReactElement, useState } from "react";
import classNames from "clsx";

import Tooltip from "app/components/elements/Tooltip";
import { ReactComponent as ActivityHoverIcon } from "app/icons/external-link.svg";
import { ReactComponent as SendIcon } from "app/icons/Send.svg";
import { ReactComponent as SwapIcon } from "app/icons/Send.svg";
import { ReactComponent as ArrowIcon } from "app/icons/arrow-up.svg";
import { ReactComponent as SuccessIcon } from "app/icons/activity-successfull.svg";
import { ReactComponent as PendingIcon } from "app/icons/activity-pending.svg";
import { ReactComponent as WarningIcon } from "app/icons/activity-warning.svg";

const ActivityBar: FC = () => {
  const [activityHovered, setActivityHovered] = useState(false);

  return (
    <div
      className={classNames(
        "fixed bottom-3 left-1/2 -translate-x-1/2",
        "w-[75rem] px-8 py-4",
        "bg-brand-darkblue/20",
        "backdrop-blur-[10px]",
        "border border-brand-main/[.05]",
        "shadow-addaccountmodal",
        "flex justify-between",
        "rounded-[.625rem]",
        "cursor-pointer"
      )}
      onMouseOver={() => setActivityHovered(true)}
      onFocus={() => setActivityHovered(true)}
      onMouseLeave={() => setActivityHovered(false)}
      onBlur={() => setActivityHovered(true)}
    >
      <div className="flex items-center">
        <ActivityIcon
          Icon={SendIcon}
          ariaLabel="Send transaction"
          className="mr-2"
        />
        <ActivityIcon
          Icon={SwapIcon}
          ariaLabel="Swap transaction"
          className="mr-2"
        />
        <ActivityIcon
          Icon="https://s2.coinmarketcap.com/static/img/coins/200x200/7278.png"
          ariaLabel="Approve interaction with aave.com"
        />
        <span className="flex items-center text-base font-bold ml-3">
          +3 waiting for approval
          <ArrowIcon className="ml-1" />
        </span>
      </div>
      <div className={centeredClassNames}>
        <span
          className={classNames(
            "w-52 h-2",
            "bg-activity",
            "rounded-xl",
            "transition-all",
            activityHovered && "h-0",
            centeredClassNames
          )}
        />
        <span
          className={classNames(
            "transition-opacity",
            "whitespace-nowrap",
            "flex items-center",
            "text-base font-bold",
            !activityHovered && "opacity-0",
            centeredClassNames
          )}
        >
          Coming soon
          <ActivityHoverIcon className="w-5 h-5 ml-1" />
        </span>
      </div>
      <div className="flex items-center">
        <StatItem count={2} className="mr-6" />
        <StatItem count={4} status="pending" className="mr-6" />
        <StatItem count={1} status="warning" />
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

type ActivityIconProps = {
  Icon: FC<{ className?: string }> | string;
  ariaLabel?: string;
  className?: string;
};

const ActivityIcon: FC<ActivityIconProps> = ({
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
          "w-6 h-6",
          "bg-white",
          "rounded-full overflow-hidden",
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
    content = <Icon className={classNames("w-6 h-6", className)} />;
  }

  if (ariaLabel) {
    return <Tooltip content={ariaLabel}>{content}</Tooltip>;
  }

  return <Icon />;
};

type StatusType = "successful" | "pending" | "warning";

type StatItemProps = {
  status?: StatusType;
  count?: number;
  className?: string;
};

const StatItem: FC<StatItemProps> = ({
  status = "successful",
  count,
  className,
}) => {
  if (!count || count === 0) {
    return <></>;
  }

  const { Icon, color } = getStatConfig(status);

  return (
    <span
      className={classNames(
        "flex items-center",
        "text-base font-bold",
        color,
        className
      )}
    >
      <Icon className="mr-2" />
      {count}
    </span>
  );
};

const getStatConfig = (status: StatusType) => {
  if (status === "pending") {
    return {
      Icon: PendingIcon,
      color: "text-[#D99E2E]",
    };
  }
  if (status === "warning") {
    return {
      Icon: WarningIcon,
      color: "text-[#EA556A]",
    };
  }
  return {
    Icon: SuccessIcon,
    color: "text-[#6BB77A]",
  };
};
