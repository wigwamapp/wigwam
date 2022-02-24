import { FC, ReactNode } from "react";
import * as HoverCardPrimitive from "@radix-ui/react-hover-card";
import { Align, Side } from "@radix-ui/popper";
import classNames from "clsx";

type sizeType = "large" | "small";

const getSizeClasses = (size: sizeType) => {
  if (size === "large") {
    return classNames(
      "rounded-[.625rem]",
      "max-w-[18rem]",
      "bg-brand-main/10 backdrop-blur-[60px]",
      "py-5 px-5"
    );
  }

  return classNames(
    "rounded-md",
    "bg-brand-main/20 backdrop-blur-[6px]",
    "py-1.5 px-3"
  );
};

type HoverCardProps = {
  content: ReactNode;
  className?: string;
  side?: Side;
  align?: Align;
  asChild?: boolean;
  size?: sizeType;
} & HoverCardPrimitive.HoverCardProps;

const HoverCard: FC<HoverCardProps> = ({
  content,
  openDelay = 200,
  className,
  asChild,
  side = "right",
  align = "start",
  size = "large",
  children,
  ...rest
}) => (
  <HoverCardPrimitive.Root openDelay={openDelay} {...rest}>
    <HoverCardPrimitive.Trigger
      asChild={asChild}
      className={classNames("cursor-pointer", className)}
    >
      {children}
    </HoverCardPrimitive.Trigger>
    <HoverCardPrimitive.Content
      portalled
      side={side}
      align={align}
      sideOffset={5}
      alignOffset={-10}
      className={classNames(getSizeClasses(size), "text-white")}
    >
      {content}
      <HoverCardPrimitive.Arrow
        offset={13}
        width={15}
        height={8}
        className={
          size === "large" ? "fill-brand-main/10" : "fill-brand-main/20"
        }
      />
    </HoverCardPrimitive.Content>
  </HoverCardPrimitive.Root>
);

export default HoverCard;
