import { FC, ReactNode } from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import classNames from "clsx";

type TooltipProps = {
  content: ReactNode;
  theme?: "primary" | "secondary";
  className?: string;
  asChild?: boolean;
} & TooltipPrimitive.TooltipProps;

const config = {
  primary: {
    side: "right" as const,
    sideOffset: 5,
    align: "start" as const,
    alignOffset: -10,
    paddings: "py-5 px-5",
    fill: "fill-brand-darklight/30",
  },
  secondary: {
    side: "bottom" as const,
    sideOffset: 2,
    align: "center" as const,
    alignOffset: 0,
    paddings: "py-3 px-8",
    fill: "fill-[#33364b]",
  },
};
const Tooltip: FC<TooltipProps> = ({
  content,
  theme = "primary",
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
      <div className="bg-brand-darklight/30 backdrop-blur-lg">
        <TooltipPrimitive.Content
          portalled
          side={config[theme].side}
          sideOffset={config[theme].sideOffset}
          align={config[theme].align}
          alignOffset={config[theme].alignOffset}
          className={classNames(
            "rounded-[.625rem]",
            theme === "secondary" && "bg-[#33364b]",
            theme === "primary" &&
              "w-[18rem] bg-brand-darklight/30 backdrop-blur-md",
            config[theme].paddings,
            "text-white",
            "z-10"
          )}
        >
          {content}
          <TooltipPrimitive.Arrow
            offset={13}
            width={15}
            height={8}
            className={config[theme].fill}
          />
        </TooltipPrimitive.Content>
      </div>
    </TooltipPrimitive.Root>
  );
};

export default Tooltip;
