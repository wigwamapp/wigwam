import { HTMLAttributes } from "react";
import classNames from "clsx";

const ContentContainer = ({
  narrow,
  className,
  ...rest
}: HTMLAttributes<HTMLDivElement> & { narrow?: boolean }) => (
  <div
    className={classNames(
      "w-full",
      narrow ? "max-w-6xl" : "max-w-[80.5rem]",
      "mx-auto",
      narrow ? "px-4" : "px-8",
      className,
    )}
    {...rest}
  />
);

export default ContentContainer;
