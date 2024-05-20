import { FC, forwardRef } from "react";
import * as ScrollArea from "@radix-ui/react-scroll-area";
import classNames from "clsx";

type ScrollAreaContainerProps = {
  className?: string;
  viewPortClassName?: string;
  scrollBarClassName?: string;
  horizontalScrollBarClassName?: string;
  verticalScrollBarClassName?: string;
  viewportAsChild?: boolean;
  viewPortStyle?: React.CSSProperties;
  hiddenScrollbar?: "vertical" | "horizontal";
} & ScrollArea.ScrollAreaProps;

const ScrollAreaContainer = forwardRef<
  HTMLDivElement,
  ScrollAreaContainerProps
>(
  (
    {
      className,
      viewPortClassName,
      viewPortStyle,
      scrollBarClassName,
      horizontalScrollBarClassName,
      verticalScrollBarClassName,
      viewportAsChild = false,
      hiddenScrollbar,
      type = "hover",
      children,
      ...rest
    },
    ref,
  ) => (
    <ScrollArea.Root
      className={classNames("overflow-hidden", className)}
      type={type}
      {...rest}
    >
      <ScrollArea.Viewport
        ref={ref}
        className={classNames(
          "w-full h-full overscroll-y-contain",
          viewPortClassName,
        )}
        style={viewPortStyle}
        asChild={viewportAsChild}
      >
        {children}
      </ScrollArea.Viewport>
      {hiddenScrollbar !== "vertical" && (
        <Scrollbar
          orientation="vertical"
          className={classNames(verticalScrollBarClassName, scrollBarClassName)}
        />
      )}
      {hiddenScrollbar !== "horizontal" && (
        <Scrollbar
          orientation="horizontal"
          className={classNames(
            horizontalScrollBarClassName,
            scrollBarClassName,
          )}
        />
      )}
      <ScrollArea.Corner />
    </ScrollArea.Root>
  ),
);

export default ScrollAreaContainer;

const Scrollbar: FC<ScrollArea.ScrollAreaScrollbarProps> = ({
  orientation,
  className,
  ...rest
}) => (
  <ScrollArea.Scrollbar
    orientation={orientation}
    className={classNames(
      {
        "w-4": orientation === "vertical",
        "h-4": orientation === "horizontal",
      },
      "p-1",
      "transition",
      className,
    )}
    {...rest}
  >
    <ScrollArea.Thumb
      className={classNames(
        "bg-white/[.07]",
        "border border-brand-main/5",
        "rounded-[.625rem]",
        "relative",
        "cursor-pointer",
        {
          "w-2": orientation === "vertical",
          "h-2 min-h-[.5rem]": orientation === "horizontal", // TODO: replace min height if we can
        },
      )}
    />
  </ScrollArea.Scrollbar>
);
