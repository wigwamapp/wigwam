import { FC, HTMLAttributes } from "react";
import classNames from "clsx";

import { ReactComponent as BackgroundIcon } from "app/icons/button-full-screen-background.svg";

type RoundedButtonProps = HTMLAttributes<HTMLButtonElement> & {
  theme?: "large" | "small";
  className?: string;
};

const RoundedButton: FC<RoundedButtonProps> = ({
  theme = "small",
  className,
  children,
  ...rest
}) => (
  <button
    type="button"
    className={classNames(
      "relative",
      "flex items-center justify-center",
      "font-bold",
      theme === "large" && "text-lg",
      theme === "small" && "text-base",
      "group",
      "z-[2]",
      className,
    )}
    {...rest}
  >
    {children}
    <BackgroundIcon
      className={classNames(
        "absolute top-0 left-0 w-full h-full",
        "bg-opacity-10",
        "group-hover:bg-opacity-20 group-focus-visible:bg-opacity-20",
        "styled-icon",
        "-z-[1]",
      )}
    />
  </button>
);

export default RoundedButton;
