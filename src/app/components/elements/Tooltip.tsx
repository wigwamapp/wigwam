import { FC, ReactNode } from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import classNames from "clsx";

type TooltipProps = {
  content: ReactNode;
  className?: string;
  asChild?: boolean;
} & TooltipPrimitive.TooltipProps;

const Tooltip: FC<TooltipProps> = ({
  content,
  delayDuration = 200,
  className,
  asChild,
  children,
  ...rest
}) => {
  return (
    <TooltipPrimitive.Root delayDuration={delayDuration} {...rest}>
      <TooltipPrimitive.TooltipTrigger asChild={asChild} className={className}>
        {children}
      </TooltipPrimitive.TooltipTrigger>
      <TooltipPrimitive.Content
        portalled
        side="bottom"
        sideOffset={2}
        align="center"
        alignOffset={0}
        className={classNames(
          "rounded-md",
          "bg-brand-main/20 backdrop-blur-[6px]",
          "py-1.5 px-3",
          "text-white",
          "z-10"
        )}
      >
        {content}
        <TooltipPrimitive.Arrow
          offset={13}
          width={15}
          height={8}
          className="fill-brand-main/20"
        />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Root>
  );
};

export default Tooltip;
