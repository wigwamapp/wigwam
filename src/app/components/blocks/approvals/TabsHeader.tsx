import { FC, ReactNode, useCallback, useEffect, useRef, useState } from "react";
import classNames from "clsx";
import * as Tabs from "@radix-ui/react-tabs";

type TabsHeaderProps = {
  values: ReadonlyArray<string>;
  currentValue: string;
  names: Record<any, ReactNode>;
  withError?: boolean;
} & Tabs.TabsListProps;

const TabsHeader: FC<TabsHeaderProps> = ({
  values,
  currentValue,
  names,
  withError = false,
}) => {
  const buttonsArrayRef = useRef<{ [key: string]: HTMLButtonElement }>({});
  const [backgroundState, setBackgroundState] = useState({
    width: 0,
    transform: 0,
  });

  const addToRefs = useCallback(
    (id: string, element: HTMLButtonElement | null) => {
      if (element) {
        buttonsArrayRef.current[id] = element;
      }
    },
    []
  );

  useEffect(() => {
    if (buttonsArrayRef?.current) {
      const activeElement = buttonsArrayRef.current[currentValue];
      setBackgroundState({
        width: activeElement.offsetWidth,
        transform: activeElement.offsetLeft,
      });
    }
  }, [currentValue, values]);

  return (
    <Tabs.List
      className={classNames(
        "flex items-center",
        "px-1 pb-1",
        "relative",
        "after:h-px after:w-full",
        "after:absolute after:bottom-0 after:left-0",
        "after:border-b after:border-brand-main/[.07]"
      )}
    >
      {values.map((value, i, arr) => {
        if (value === "error" && !withError) return null;

        const active = value === currentValue;
        const last = i === arr.length - 1;

        return (
          <Tabs.Trigger
            key={value}
            value={value}
            className={classNames(
              "text-sm",
              "px-5 py-1",
              "rounded-lg",
              "transition-all",
              "relative",
              "flex flex-col items-center",
              "before:content-[attr(data-text)]",
              "before:h-0",
              "before:invisible",
              "before:pointer-events-none",
              "before:overflow-hidden",
              "before:font-bold",
              "after:w-full after:h-px",
              "after:absolute after:top-[calc(100%+0.25rem-1px)] after:left-0",
              "after:border-b after:border-brand-main/[.2]",
              "after:opacity-0 after:transition-opacity",
              !last && "mr-1",
              active && "font-bold",
              !active && "hover:bg-brand-main/5 hover:after:opacity-100"
            )}
            data-text={names[value]}
            ref={(el) => addToRefs(value, el)}
          >
            {names[value]}
          </Tabs.Trigger>
        );
      })}
      <span
        className={classNames(
          "h-px",
          "block",
          "absolute bottom-0 left-0",
          "bg-buttonaccent",
          "transition-all"
        )}
        style={{
          width: backgroundState.width,
          transform: `translateX(${backgroundState.transform}px)`,
        }}
      />
    </Tabs.List>
  );
};

export default TabsHeader;
