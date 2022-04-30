import { FC } from "react";
import classNames from "clsx";

// import { ReactComponent as ComingSoonBg } from "app/icons/ComingSoon.svg";
import bg from "app/icons/ComingSoon.png";

interface ComingSoonProps {
  label: string;
  size?: "large" | "small";
  className?: string;
}
const ComingSoon: FC<ComingSoonProps> = ({
  label,
  size = "large",
  className = "mt-[6.25rem]",
}) => {
  return (
    <div
      className={classNames("w-full", "flex flex-col items-center", className)}
    >
      {/* <ComingSoonBg width={size === "small" ? 400 : 510} /> */}
      <img src={bg} alt="beautiful-sunset" />
      <div
        className={classNames(
          size === "small" && "mt-[1.92rem]",
          size !== "small" && "mt-[3.92rem]",
          "flex flex-col text-brand-light text-center"
        )}
      >
        <h2
          className={classNames(
            "mt-2",
            "text-xl font-bold",
            size === "small" && "text-xl",
            size === "large" && "text-[2.5rem]"
          )}
        >
          We are on the way...
        </h2>
        <p
          className={classNames(
            "mt-4",
            "text-brand-font",
            size === "small" && "text-md",
            size !== "small" && "text-2xl"
          )}
        >
          {label} section is under development
        </p>
      </div>
    </div>
  );
};

export default ComingSoon;
