import { FC } from "react";
import classNames from "clsx";

type SoonTagProps = {
  className?: string;
};

export const SoonTag: FC<SoonTagProps> = ({ className }) => (
  <span
    className={classNames(
      "flex items-center justify-center",
      "px-1.5 h-5 ml-2",
      "text-xs font-medium text-brand-main",
      "bg-brand-main/20",
      "border border-brand-main/50",
      "rounded-md",
      "opacity-80",
      "transition-opacity",
      "group-hover:opacity-100",
      className
    )}
  >
    Soon
  </span>
);
