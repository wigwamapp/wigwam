import { FC, ReactNode, useCallback, useState } from "react";
import * as Collapsible from "@radix-ui/react-collapsible";
import classNames from "clsx";

import { useOverflowElement } from "app/hooks";
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
  const overflowElement = useOverflowElement();
  const [open, setOpen] = useState(false);

  const handleTriggerClick = useCallback(
    (state: boolean) => {
      if (state && overflowElement) {
        setTimeout(() => {
          overflowElement.scrollTo({
            behavior: "smooth",
            top: overflowElement.scrollHeight,
            left: 0,
          });
        }, 100);
      }
      setOpen(state);
    },
    [overflowElement],
  );

  return (
    <Collapsible.Root
      open={open}
      onOpenChange={handleTriggerClick}
      className={className}
      {...rest}
    >
      <Collapsible.Trigger
        className={classNames(
          "w-full flex items-center mb-3",
          triggerClassName,
        )}
      >
        <CollapseIcon
          className={classNames(
            "w-[1.25rem] h-auto transition-transform",
            open && "rotate-90",
          )}
        />
        <span className={"text-xl font-bold text-brand-inactivelight ml-1.5"}>
          {label}
        </span>
      </Collapsible.Trigger>
      <Collapsible.Content>{children}</Collapsible.Content>
    </Collapsible.Root>
  );
};

export default Collapse;
