import {
  FC,
  forwardRef,
  HTMLAttributes,
  ForwardedRef,
  ForwardRefExoticComponent,
  RefAttributes,
} from "react";
import classNames from "clsx";
import Link, { LinkProps } from "lib/navigation/Link";

import Tooltip, { TooltipProps } from "./Tooltip";
import SmartLink from "./SmartLink";

export type IconedButtonProps = {
  disabled?: boolean;
  Icon: FC<{ className?: string }>;
  iconProps?: any;
  theme?: "primary" | "secondary" | "tertiary";
  smartLink?: boolean;
  asSpan?: boolean;
  iconClassName?: string;
} & (HTMLAttributes<HTMLButtonElement> | LinkProps);

const IconedButton = forwardRef<HTMLElement, IconedButtonProps>(
  (
    {
      theme = "primary",
      disabled = false,
      className,
      Icon,
      iconProps,
      smartLink = false,
      iconClassName,
      asSpan = false,
      ...rest
    },
    ref,
  ) => {
    const classNamesList = classNames(
      "group",
      (theme === "primary" || theme === "secondary") && "w-5 h-5",
      theme === "tertiary" && "w-6 h-6",
      theme === "primary" && "bg-brand-main/20",
      theme === "secondary" && "bg-brand-main/[.1]",
      "rounded",
      "flex justify-center items-center",
      "transition",
      disabled && "cursor-default",
      !disabled && [
        "hover:bg-brand-main/30 hover:shadow-buttonsecondary",
        "focus-visible:bg-brand-main/30 focus-visible:shadow-buttonsecondary",
        "active:bg-brand-main/20 active:shadow-none",
      ],
      className,
    );

    const content = (
      <Icon
        className={classNames(
          (theme === "primary" || theme === "secondary") && "w-4",
          theme === "tertiary" && "w-6",
          "h-auto",
          "transition-opacity",
          "group-active:opacity-60",
          iconClassName,
        )}
        {...iconProps}
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
      const Component = smartLink ? SmartLink : Link;

      return (
        <Component
          ref={ref as ForwardedRef<HTMLAnchorElement>}
          className={classNamesList}
          {...rest}
        >
          {content}
        </Component>
      );
    }

    return asSpan ? (
      <span
        ref={ref as ForwardedRef<HTMLButtonElement>}
        role="button"
        tabIndex={rest.tabIndex ?? 0}
        onClick={rest.onClick}
        onKeyDown={(e) => {
          const keyCode = e.keyCode;
          if (keyCode === 32 || keyCode === 13) {
            rest.onClick?.(e as any);
          }
        }}
        className={classNamesList}
        {...rest}
      >
        {content}
      </span>
    ) : (
      <button
        ref={ref as ForwardedRef<HTMLButtonElement>}
        type="button"
        className={classNamesList}
        disabled={disabled}
        {...rest}
      >
        {content}
      </button>
    );
  },
);

type ForwardRefProps = IconedButtonProps & {
  tooltipProps?: TooltipProps;
};

const withTooltip = (
  WrappedComponent: ForwardRefExoticComponent<
    ForwardRefProps & RefAttributes<HTMLElement>
  >,
) => {
  return forwardRef<HTMLElement, ForwardRefProps>(
    ({ tooltipProps, ...rest }, ref) => {
      const ariaLabel = rest["aria-label"];
      if (ariaLabel) {
        return (
          <Tooltip asChild content={ariaLabel} {...tooltipProps}>
            <WrappedComponent {...rest} ref={ref} />
          </Tooltip>
        );
      } else {
        return <WrappedComponent {...rest} ref={ref} />;
      }
    },
  );
};

export default withTooltip(IconedButton);
