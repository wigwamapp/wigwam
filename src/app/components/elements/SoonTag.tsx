import { FC } from "react";
import classNames from "clsx";

type SoonTagProps = {
  className?: string;
};

export const SoonTag: FC<SoonTagProps> = ({ className }) => (
  <span
    className={classNames(
      "flex items-center justify-center",
      "px-1 h-4 ml-2",
      "text-[0.625rem] font-medium text-brand-main",
      "bg-brand-main/20",
      "border border-brand-main/50",
      "rounded-[0.3125rem]",
      "opacity-75",
      "transition-opacity",
      "group-hover:opacity-100",
      className,
    )}
  >
    Soon
  </span>
);
