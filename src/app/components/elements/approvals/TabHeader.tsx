import { FC, PropsWithChildren, ReactNode } from "react";
import classNames from "clsx";

import TooltipIcon from "../TooltipIcon";
import Tooltip from "../Tooltip";

type TabHeaderProps = PropsWithChildren<{
  tooltip?: ReactNode;
  className?: string;
}>;

const TabHeader: FC<TabHeaderProps> = ({ tooltip, children, className }) => {
  const content = (
    <h2
      className={classNames(
        "text-xl font-bold",
        tooltip ? undefined : classNames("mb-4", className),
      )}
    >
      {children}
    </h2>
  );

  if (tooltip) {
    return (
      <div className={classNames("flex items-center mb-4", className)}>
        {content}
        <Tooltip content={tooltip} size="large" className="ml-2">
          <TooltipIcon />
        </Tooltip>
      </div>
    );
  }

  return content;
};

export default TabHeader;
