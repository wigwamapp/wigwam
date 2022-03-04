import { FC, ReactNode } from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import classNames from "clsx";

type TooltipProps = {
  content: ReactNode;
  asChild?: boolean;
  hideOnClick?: boolean;
  className?: string;
} & TooltipPrimitive.TooltipProps;

const Tooltip: FC<TooltipProps> = ({
  content,
  delayDuration = 200,
  asChild,
  hideOnClick = false,
  children,
  className,
  ...rest
}) => {
  return (
    <TooltipPrimitive.Root delayDuration={delayDuration} {...rest}>
      <TooltipPrimitive.TooltipTrigger
        asChild={asChild}
        className={className}
        onClick={(evt) => !hideOnClick && evt.preventDefault()}
        onMouseDown={(evt) => !hideOnClick && evt.preventDefault()}
      >
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
          "text-white"
        )}
      >
        {content}
        <TooltipPrimitive.Arrow
          offset={6}
          width={15}
          height={8}
          className="fill-brand-main/20"
        />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Root>
  );
};

export default Tooltip;
