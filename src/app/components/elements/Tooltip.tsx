import { FC } from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

type TooltipProps = {
  title: string;
  tooltip: string;
};

const Tooltip: FC<TooltipProps> = ({ title, tooltip }) => {
  return (
    <TooltipPrimitive.Root>
      <TooltipPrimitive.TooltipTrigger
        asChild
      ></TooltipPrimitive.TooltipTrigger>
      <TooltipPrimitive.Content
        sideOffset={5}
        className={"bg-black/95 rounded-[.375rem]"}
      >
        Add to library
        <TooltipPrimitive.Arrow className="" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Root>
  );
};

export default Tooltip;
