import { FC, ReactNode } from "react";
import * as HoverCardPrimitive from "@radix-ui/react-hover-card";
import classNames from "clsx";

type HoverCardProps = {
  content: ReactNode;
  className?: string;
  asChild?: boolean;
} & HoverCardPrimitive.HoverCardProps;

const HoverCard: FC<HoverCardProps> = ({
  content,
  openDelay = 200,
  className,
  asChild,
  children,
  ...rest
}) => {
  /* useLayoutEffect(() => {
    const el: HTMLElement | null = document.querySelector(
      "[data-radix-popper-content-wrapper]"
    );
    if (el) {
      el.style.willChange = "auto";
    }
  }, []); */

  return (
    <HoverCardPrimitive.Root openDelay={openDelay} {...rest}>
      <HoverCardPrimitive.Trigger asChild={asChild} className={className}>
        {children}
      </HoverCardPrimitive.Trigger>
      <HoverCardPrimitive.Content
        portalled
        side="right"
        sideOffset={5}
        align="start"
        alignOffset={-10}
        className={classNames(
          "rounded-[.625rem]",
          "w-[18rem] bg-brand-darklight/30 backdrop-blur-md",
          "py-5 px-5",
          "text-white"
        )}
        style={{
          willChange: "auto",
        }}
      >
        {content}
        <HoverCardPrimitive.Arrow
          offset={13}
          width={15}
          height={8}
          className="fill-brand-darklight/30"
        />
      </HoverCardPrimitive.Content>
    </HoverCardPrimitive.Root>
  );
};

export default HoverCard;
