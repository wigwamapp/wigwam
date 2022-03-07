import { FC, useState } from "react";
import classNames from "clsx";
import { match } from "ts-pattern";
import Tippy, { TippyProps } from "@tippyjs/react";

import { useOverflowRef, useTippySingletonTarget } from "app/hooks";

type sizeType = "large" | "small";

export type TooltipProps = {
  size?: sizeType;
  asChild?: boolean;
  className?: string;
} & Omit<TippyProps, "appendTo">;

const Tooltip: FC<TooltipProps> = ({
  interactive,
  content,
  maxWidth,
  placement,
  hideOnClick = false,
  size = "large",
  asChild = false,
  className,
  children,
  ...rest
}) => {
  const [arrow, setArrow] = useState(null);
  const overflowElementRef = useOverflowRef();
  const singletonTarget = useTippySingletonTarget();

  return (
    <Tippy
      content={
        <>
          <div
            className={classNames(
              "text-white",
              "border border-[#323453]",
              getSizeClasses(size)
            )}
          >
            {content}
            <div
              className={classNames(
                "tooltip-arrow-wrapper",
                "block",
                "w-3.5 h-3.5",
                "overflow-hidden",
                "flex items-center justify-center"
              )}
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              ref={setArrow}
            >
              <span
                className={classNames(
                  "tooltip-arrow-icon",
                  "block",
                  "w-2 h-2",
                  "rotate-45",
                  "bg-[#323453]",
                  "rounded-bl-[1px]"
                )}
              />
            </div>
          </div>
        </>
      }
      interactive={interactive ?? size === "large"}
      appendTo={overflowElementRef?.current ?? document.body}
      maxWidth={maxWidth ?? (size === "large" ? "18rem" : "none")}
      placement={placement ?? (size === "large" ? "right-start" : "bottom")}
      hideOnClick={hideOnClick}
      className="pointer-events-auto"
      singleton={singletonTarget}
      popperOptions={{
        modifiers: [
          {
            name: "arrow",
            options: {
              element: arrow,
              padding: 10,
            },
          },
          {
            name: "offset",
            options: {
              offset: ({ placement }: any) => {
                if (placement.endsWith("start")) {
                  return [-10, 10];
                }
                if (placement.endsWith("end")) {
                  return [10, 10];
                }
                return [0, 10];
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
        "py-1.5 px-3"
      )
    );
