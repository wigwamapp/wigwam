import { FC, ReactNode } from "react";
import classNames from "clsx";

export const BadgeWrapper: FC<{
  showBadge: boolean | undefined;
  children: ReactNode | ReactNode[];
  className?: string;
}> = ({ showBadge, children, className }) => (
  <div
    className={classNames(
      "relative",
      showBadge && [
        "after:content-[' '] after:absolute after:right-[1px] after:top-0 after:h-2 after:w-2",
        "after:bg-brand-redtwo after:rounded-full after:animate-pulse",
      ],
      className,
    )}
  >
    {children}
  </div>
);

export default BadgeWrapper;
