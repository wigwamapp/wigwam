import { FC, ReactNode } from "react";
import * as HoverCardPrimitive from "@radix-ui/react-hover-card";
import { Side } from "@radix-ui/popper";
import classNames from "clsx";

type HoverCardProps = {
  content: ReactNode;
  className?: string;
  side?: Side;
  asChild?: boolean;
} & HoverCardPrimitive.HoverCardProps;

const HoverCard: FC<HoverCardProps> = ({
  content,
  openDelay = 200,
  className,
  asChild,
  side = "right",
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
      sideOffset={5}
      align="start"
      alignOffset={-10}
      className={classNames(
        "rounded-[.625rem]",
        "max-w-[18rem]",
        "bg-brand-main/10 backdrop-blur-[60px]",
        "py-5 px-5",
        "text-white"
      )}
    >
      {content}
      <HoverCardPrimitive.Arrow
        offset={13}
        width={15}
        height={8}
        className="fill-brand-main/10"
      />
    </HoverCardPrimitive.Content>
  </HoverCardPrimitive.Root>
);

export default HoverCard;
