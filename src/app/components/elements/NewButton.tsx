import { FC, HTMLAttributes } from "react";
import classNames from "clsx";
import Link, { LinkProps } from "lib/navigation/Link";

type NewButtonProps = {
  theme?: "primary" | "secondary" | "tertiary" | "clean";
} & (HTMLAttributes<HTMLButtonElement> | LinkProps);

const NewButton: FC<NewButtonProps> = ({
  theme = "primary",
  className,
  children,
  ...rest
}) => {
  const classNamesList = classNames(
    "py-3 px-4",
    theme !== "clean" && "min-w-[10rem]",
    "text-brand-light text-base font-bold",
    theme === "primary" && "bg-buttonaccent bg-opacity-90",
    theme === "secondary" && "bg-brand-main bg-opacity-10",
    "rounded-[.375rem]",
    "inline-flex justify-center",
    "transition",
    theme === "primary" && [
      "hover:bg-opacity-100 hover:shadow-buttonaccent",
      "focus:bg-opacity-100 focus:shadow-buttonaccent",
      "active:bg-opacity-70 active:shadow-none",
    ],
    (theme === "secondary" || theme === "tertiary") && [
      "hover:bg-brand-darklight hover:bg-opacity-100 hover:shadow-buttonsecondary",
      "focus:bg-brand-darklight focus:bg-opacity-100 focus:shadow-buttonsecondary",
      "active:bg-brand-main active:text-brand-light/60 active:bg-opacity-10 active:shadow-none",
    ],
    theme === "clean" && "font-medium hover:opacity-70 focus:opacity-70",
    className
  );

  if ("href" in rest) {
    return (
      <a
        target="_blank"
        rel="nofollow noreferrer"
        className={classNamesList}
        {...rest}
      >
        {children}
      </a>
    );
  }

  if ("to" in rest) {
    return (
      <Link className={classNamesList} {...rest}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classNamesList} {...rest}>
      {children}
    </button>
  );
};

export default NewButton;
