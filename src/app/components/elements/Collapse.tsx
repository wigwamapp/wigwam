import { FC, ReactNode, useCallback, useState } from "react";
import * as Collapsible from "@radix-ui/react-collapsible";
import classNames from "clsx";

import { useOverflowRef } from "app/hooks";
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
  const scrollAreaRef = useOverflowRef();
  const [open, setOpen] = useState(false);

  const handleTriggerClick = useCallback(
    (state) => {
      if (state && scrollAreaRef?.current) {
        setTimeout(() => {
          scrollAreaRef.current?.scrollTo({
            behavior: "smooth",
            top: scrollAreaRef.current?.scrollHeight,
            left: 0,
          });
        }, 100);
      }
      setOpen(state);
    },
    [scrollAreaRef]
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
