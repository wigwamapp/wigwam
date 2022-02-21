import { FC, ReactNode } from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import classNames from "clsx";

type TooltipProps = {
  TooltipIcon?: ReactNode;
  ariaLabel: string;
  theme?: "primary" | "secondary";
  withTrigger?: boolean;
};

const config = {
  primary: {
    side: "right" as const,
    sideOffset: 5,
    align: "start" as const,
    alignOffset: -10,
    paddings: "py-5 px-5",
  },
  secondary: {
    side: "bottom" as const,
    sideOffset: 2,
    align: "center" as const,
    alignOffset: 0,
    paddings: "py-3 px-8",
  },
};
const Tooltip: FC<TooltipProps> = ({
  ariaLabel,
  TooltipIcon,
  withTrigger = false,
  theme = "primary",
  children,
}) => {
  return (
    <TooltipPrimitive.Root delayDuration={300}>
      {withTrigger ? (
        TooltipIcon
      ) : (
        <TooltipPrimitive.TooltipTrigger
          aria-label={ariaLabel}
          className={classNames("ml-2 mt-1.5 flex")}
        >
          {TooltipIcon}
        </TooltipPrimitive.TooltipTrigger>
      )}
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
          config[theme].paddings,
          "text-white",
          "z-10"
        )}
      >
        {children ? children : ariaLabel}
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
