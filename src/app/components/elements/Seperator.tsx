import { FC } from "react";
import classNames from "clsx";

type SeparatorProps = {
  direction?: "vertical" | "horizontal";
  position?: "start" | "end";
  className?: string;
};

const Separator: FC<SeparatorProps> = ({
  direction = "horizontal",
  position,
  className,
}) => (
  <span
    className={classNames(
      "block",
      "bg-brand-main/[.07]",
      position && "absolute",
      direction === "horizontal"
        ? classNames(
            "w-full h-px",
            "left-0 right-0",
            position === "start" ? "top-0" : "bottom-0",
          )
        : classNames(
            "w-px h-full",
            "top-0 bottom-0",
            position === "start" ? "left-0" : "right-0",
          ),
      className,
    )}
  />
);

export default Separator;
