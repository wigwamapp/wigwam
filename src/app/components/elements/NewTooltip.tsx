import { FC, useState } from "react";
import classNames from "clsx";
import { match } from "ts-pattern";
import Tippy, { TippyProps } from "@tippyjs/react";

type sizeType = "large" | "small";

type NewTooltipProps = {
  size?: sizeType;
  className?: string;
} & TippyProps;

const NewTooltip: FC<NewTooltipProps> = ({
  interactive,
  content,
  appendTo,
  maxWidth,
  placement,
  hideOnClick = false,
  size = "large",
  className,
  children,
  ...rest
}) => {
  const [arrow, setArrow] = useState(null);

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
              "w-[15px] h-[15px]",
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
                "bg-brand-main/10 backdrop-blur-[60px]"
              )}
            />
          </div>
        </>
      }
      interactive={interactive ?? size === "large"}
      appendTo={appendTo ?? document.body}
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
      <button className={className}>{children}</button>
    </Tippy>
  );
};

export default NewTooltip;

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
