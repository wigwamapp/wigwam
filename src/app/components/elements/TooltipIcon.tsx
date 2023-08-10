import { FC } from "react";
import classNames from "clsx";

import { ReactComponent as InfoIcon } from "app/icons/info-icon.svg";

type TooltipIconProps = {
  theme?: "light" | "dark";
  className?: string;
};

const TooltipIcon: FC<TooltipIconProps> = ({ theme = "light", className }) => (
  <span
    className={classNames(
      "flex items-center w-5 h-5 rounded-full",
      theme === "light" && "bg-brand-main/[.15]",
      theme === "dark" && "bg-black/25",
      className,
    )}
  >
    <InfoIcon className="w-full h-auto" />
  </span>
);

export default TooltipIcon;
