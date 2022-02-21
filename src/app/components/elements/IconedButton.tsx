import React, { FC, forwardRef, HTMLAttributes, ForwardedRef } from "react";
import classNames from "clsx";
import Link, { LinkProps } from "lib/navigation/Link";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

import Tooltip from "app/components/elements/Tooltip";

type IconedButtonProps = {
  Icon: FC<{ className?: string }>;
  theme?: "primary" | "secondary" | "tertiary";
  iconClassName?: string;
} & (HTMLAttributes<HTMLButtonElement> | LinkProps);

const IconedButton = forwardRef<HTMLElement, IconedButtonProps>(
  ({ theme = "primary", className, Icon, iconClassName, ...rest }, ref) => {
    const classNamesList = classNames(
      "group",
      (theme === "primary" || theme === "secondary") && "w-5 h-5",
      theme === "tertiary" && "w-6 h-6",
      theme === "primary" && "bg-brand-main/20",
      theme === "secondary" && "bg-brand-main/[.05]",
      "rounded",
      "flex justify-center items-center",
      "transition",
      "hover:bg-brand-main/30 hover:shadow-buttonsecondary",
      "focus:bg-brand-main/30 focus:shadow-buttonsecondary",
      "active:bg-brand-main/20 active:shadow-none",
      className
    );

    const content = (
      <Icon
        className={classNames(
          (theme === "primary" || theme === "secondary") && "w-4",
          theme === "tertiary" && "w-6",
          "h-auto",
          "transition-opacity",
          "group-active:opacity-60",
          iconClassName
        )}
      />
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
          {content}
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
          {content}
        </Link>
      );
    }

    return (
      <button
        ref={ref as ForwardedRef<HTMLButtonElement>}
        type="button"
        className={classNamesList}
        {...rest}
      >
        {content}
      </button>
    );
  }
);

const withTooltip = (
  WrappedComponent: React.ForwardRefExoticComponent<
    IconedButtonProps & React.RefAttributes<HTMLElement>
  >
) => {
  return forwardRef(
    (props: IconedButtonProps, ref: ForwardedRef<HTMLElement>) => {
      const ariaLabel = props["aria-label"];
      if (ariaLabel) {
        return (
          <Tooltip theme="secondary" asChild content={ariaLabel}>
            <WrappedComponent {...props} ref={ref} />
          </Tooltip>
        );
      } else {
        return <WrappedComponent {...props} ref={ref} />;
      }
    }
  );
};

export default withTooltip(IconedButton);
