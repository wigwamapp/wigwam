import { FC, ReactNode, useState } from "react";
import * as Collapsible from "@radix-ui/react-collapsible";
import classNames from "clsx";

import { ReactComponent as CollapseIcon } from "app/icons/collapse.svg";

type CollapseProps = Collapsible.CollapsibleProps & {
  label: ReactNode | string;
  triggerClassName?: string;
};

const Collapse: FC<CollapseProps> = ({
  label,
  children,
  className,
  triggerClassName,
  ...rest
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible.Root
      open={open}
      onOpenChange={setOpen}
      className={className}
      {...rest}
    >
      <Collapsible.Trigger
        className={classNames(
          "w-full flex items-center mb-3",
          triggerClassName
        )}
      >
        <CollapseIcon
          className={classNames("transition-transform", open && "rotate-90")}
        />
        <span
          className={
            "text-2xl font-bold capitalize text-brand-inactivelight ml-3"
          }
        >
          {label}
        </span>
      </Collapsible.Trigger>
      <Collapsible.Content>{children}</Collapsible.Content>
    </Collapsible.Root>
  );
};

export default Collapse;
