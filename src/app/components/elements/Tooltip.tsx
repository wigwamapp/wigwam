import { FC } from "react";
import classNames from "clsx";
import { match } from "ts-pattern";
import Tippy, { TippyProps } from "@tippyjs/react";

import { useOverflowRef, useTippySingletonTarget } from "app/hooks";

type sizeType = "large" | "small";

export type TooltipProps = {
  size?: sizeType;
  asChild?: boolean;
  missSingleton?: boolean;
  className?: string;
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
  children,
  delay = [100, 50],
  duration = [100, 50],
  ...rest
}) => {
  const overflowElementRef = useOverflowRef();
  const singletonTarget = useTippySingletonTarget();

  return (
    <Tippy
      content={
        <>
          <div
            className={classNames(
              "text-white",
              "border border-white/5",
              getSizeClasses(size)
            )}
          >
            {content}
          </div>
        </>
      }
      interactive={interactive ?? size === "large"}
      appendTo={overflowElementRef?.current ?? document.body}
      maxWidth={maxWidth ?? (size === "large" ? "18rem" : "none")}
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
      classNames(
        "rounded-[.625rem]",
        "bg-brand-main/10 backdrop-blur-[60px]",
        "py-5 px-5"
      )
    )
    .otherwise(() =>
      classNames(
        "rounded-md",
        "bg-brand-main/20 backdrop-blur-[6px]",
        "py-1 px-3"
      )
    );
