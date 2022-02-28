import { FC, forwardRef } from "react";
import * as ScrollArea from "@radix-ui/react-scroll-area";
import classNames from "clsx";

type ScrollAreaContainerProps = {
  className?: string;
  viewPortClassName?: string;
  scrollBarClassName?: string;
  viewportAsChild?: boolean;
} & ScrollArea.ScrollAreaProps;

const ScrollAreaContainer = forwardRef<
  HTMLDivElement,
  ScrollAreaContainerProps
>(
  (
    {
      className,
      viewPortClassName,
      scrollBarClassName,
      viewportAsChild = false,
      type = "scroll",
      children,
      ...rest
    },
    ref
  ) => (
    <ScrollArea.Root
      ref={ref}
      className={classNames("overflow-hidden", className)}
      type={type}
      {...rest}
    >
      <ScrollArea.Viewport
        className={classNames(
          "w-full h-full overscroll-contain",
          viewPortClassName
        )}
        asChild={viewportAsChild}
      >
        {children}
      </ScrollArea.Viewport>
      <Scrollbar orientation="vertical" className={scrollBarClassName} />
      <Scrollbar orientation="horizontal" className={scrollBarClassName} />
      <ScrollArea.Corner />
    </ScrollArea.Root>
  )
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
      className
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
        }
      )}
    />
  </ScrollArea.Scrollbar>
);
