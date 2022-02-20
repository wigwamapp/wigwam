import { FC } from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import classNames from "clsx";

type TooltipProps = {
  TooltipIcon?: FC;
  ariaLabel: string;
  theme?: "primary" | "secondary";
};

const config = {
  primary: {
    side: "right" as const,
    sideOffset: 5,
    align: "start" as const,
    alignOffset: -10,
  },
  secondary: {
    side: "bottom" as const,
    sideOffset: 2,
    align: "center" as const,
    alignOffset: 0,
  },
};
const Tooltip: FC<TooltipProps> = ({
  ariaLabel,
  TooltipIcon,
  theme = "primary",
  children,
}) => {
  return (
    <TooltipPrimitive.Root delayDuration={300}>
      <TooltipPrimitive.TooltipTrigger
        aria-label={ariaLabel}
        className={classNames("ml-2 mt-1.5 flex")}
      >
        {!!TooltipIcon ? <TooltipIcon /> : children}
      </TooltipPrimitive.TooltipTrigger>
      <TooltipPrimitive.Content
        side={config[theme].side}
        portalled
        sideOffset={config[theme].sideOffset}
        align={config[theme].align}
        alignOffset={config[theme].alignOffset}
        className={classNames(
          "rounded-[.625rem]",
          theme === "secondary" && "bg-brand-dark",
          theme === "primary" &&
            "w-[18rem] bg-brand-darklight/30 backdrop-filter backdrop-blur-lg",
          "border border-brand-light/5",
          "py-5 px-5",
          "text-white",
          "z-10"
        )}
      >
        {!!TooltipIcon ? children : ariaLabel}
        <TooltipPrimitive.Arrow
          offset={13}
          width={15}
          height={8}
          style={{ stroke: "rgb(42 44 63 / 0.3)", fill: "rgb(42 44 63 / 0.3)" }}
        />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Root>
  );
};

export default Tooltip;
