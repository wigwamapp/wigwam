import { HTMLAttributes, ForwardedRef, forwardRef } from "react";
import classNames from "clsx";
import Link, { LinkProps } from "lib/navigation/Link";

type NewButtonProps = {
  theme?: "primary" | "secondary" | "tertiary" | "clean";
  disabled?: boolean;
} & (HTMLAttributes<HTMLButtonElement> | LinkProps);

const NewButton = forwardRef<HTMLElement, NewButtonProps>(
  (
    { theme = "primary", disabled = false, className, children, ...rest },
    ref
  ) => {
    const classNamesList = classNames(
      "py-3 px-4",
      theme !== "clean" && "min-w-[10rem]",
      "text-brand-light text-base font-bold",
      theme === "primary" && "bg-buttonaccent bg-opacity-90",
      theme === "secondary" && "bg-brand-main bg-opacity-10",
      "rounded-[.375rem]",
      "inline-flex justify-center",
      "transition",
      theme === "primary" &&
        !disabled && [
          "hover:bg-opacity-100 hover:shadow-buttonaccent",
          "focus-visible:bg-opacity-100 focus-visible:shadow-buttonaccent",
          "active:bg-opacity-70 active:shadow-none",
        ],
      (theme === "secondary" || theme === "tertiary") &&
        !disabled && [
          "hover:bg-brand-darklight hover:bg-opacity-100 hover:shadow-buttonsecondary",
          "focus-visible:bg-brand-darklight focus-visible:bg-opacity-100 focus-visible:shadow-buttonsecondary",
          "active:bg-brand-main active:text-brand-light/60 active:bg-opacity-10 active:shadow-none",
        ],
      theme === "clean" &&
        "font-medium hover:opacity-70 focus-visible:opacity-70",
      disabled && "opacity-40 cursor-not-allowed",
      className
    );

    if ("href" in rest) {
      return (
        <a
          ref={ref as ForwardedRef<HTMLAnchorElement>}
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
        <Link
          ref={ref as ForwardedRef<HTMLAnchorElement>}
          className={classNamesList}
          {...rest}
        >
          {children}
        </Link>
      );
    }

    return (
      <button
        ref={ref as ForwardedRef<HTMLButtonElement>}
        className={classNamesList}
        {...rest}
      >
        {children}
      </button>
    );
  }
);

export default NewButton;
