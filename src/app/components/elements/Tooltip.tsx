import { FC, useState } from "react";
import classNames from "clsx";
import { match } from "ts-pattern";
import Tippy, { TippyProps } from "@tippyjs/react";
import { useOverflowRef } from "app/hooks";

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

  return (
    <Tippy
      content={
        <>
          <div className={classNames("text-white", getSizeClasses(size))}>
            {content}
          </div>
          <div
            className={classNames(
              "tooltip-arrow-wrapper",
              "block",
              "w-[16px] h-[16px]",
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
                "w-2.5 h-2.5",
                "rotate-45",
                size === "large" && "bg-brand-main/10 backdrop-blur-[60px]",
                size === "small" && "bg-brand-main/20 backdrop-blur-[6px]"
              )}
            />
          </div>
        </>
      }
      interactive={interactive ?? size === "large"}
      appendTo={overflowElementRef?.current ?? document.body}
      maxWidth={maxWidth ?? size === "large" ? "18rem" : "none"}
      placement={placement ?? size === "large" ? "right-start" : "bottom"}
      hideOnClick={hideOnClick}
      className="pointer-events-auto"
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
                return placement.endsWith("start") ? [-10, 16] : [10, 16];
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
