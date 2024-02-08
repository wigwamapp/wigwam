import { FC } from "react";
import classNames from "clsx";
import { match } from "ts-pattern";
import Tippy, { TippyProps } from "@tippyjs/react";

import { useOverflowElement, useTippySingletonTarget } from "app/hooks";

type sizeType = "large" | "small";

export type TooltipProps = {
  size?: sizeType;
  asChild?: boolean;
  missSingleton?: boolean;
  className?: string;
  tooltipClassName?: string;
} & Omit<TippyProps, "appendTo">;

const Tooltip: FC<TooltipProps> = ({
  interactive,
  content,
  maxWidth,
  placement,
  hideOnClick = false,
  size = "small",
  asChild = false,
  missSingleton,
  className,
  tooltipClassName,
  children,
  delay = [100, 50],
  duration = [100, 50],
  ...rest
}) => {
  const overflowElement = useOverflowElement();
  const singletonTarget = useTippySingletonTarget();

  return (
    <Tippy
      content={
        <>
          <div
            className={classNames(
              "text-white text-xs",
              "border border-white/5",
              getSizeClasses(size),
              tooltipClassName,
            )}
          >
            {content}
          </div>
        </>
      }
      interactive={interactive ?? size === "large"}
      appendTo={overflowElement ?? document.body}
      maxWidth={maxWidth ?? "18rem"}
      placement={placement ?? (size === "large" ? "right-start" : "bottom")}
      hideOnClick={hideOnClick}
      className="pointer-events-auto"
      singleton={missSingleton ? undefined : singletonTarget}
      duration={duration}
      delay={delay}
      zIndex={2147483648}
      popperOptions={{
        modifiers: [
          {
            name: "offset",
            options: {
              offset: ({ placement }: any) => {
                if (placement.endsWith("start")) {
                  return [-10, 6];
                }
                if (placement.endsWith("end")) {
                  return [10, 6];
                }
                return [0, 6];
              },
            },
          },
        ],
      }}
      {...rest}
    >
      {asChild ? children : <button className={className}>{children}</button>}
    </Tippy>
  );
};

export default Tooltip;

const getSizeClasses = (size: sizeType) =>
  match(size)
    .with("large", () =>
      classNames("rounded-[.625rem]", "bg-brand-darkbg", "py-5 px-5"),
    )
    .otherwise(() =>
      classNames(
        "rounded-md",
        "overflow-hidden truncate",
        "bg-brand-darkgray",
        "py-1 px-3",
      ),
    );
