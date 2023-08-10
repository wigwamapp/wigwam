import { FC, ReactNode, useEffect, useState } from "react";
import classNames from "clsx";
import * as Tabs from "@radix-ui/react-tabs";

type TabsHeaderProps = {
  values: ReadonlyArray<string>;
  currentValue: string;
  names: Record<any, ReactNode>;
  withError?: boolean;
  oneSuccess?: boolean;
} & Tabs.TabsListProps;

const TabsHeader: FC<TabsHeaderProps> = ({
  values,
  currentValue,
  names,
  withError = false,
  oneSuccess = true,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(values.findIndex((value) => value === currentValue));
  }, [currentValue, values]);

  return (
    <Tabs.List
      className={classNames(
        "flex items-center",
        "pl-1 pb-1",
        "relative",
        "after:h-px after:w-full",
        "after:absolute after:bottom-0 after:left-0",
        "after:border-b after:border-brand-main/[.07]",
      )}
    >
      {values.map((value, i, arr) => {
        if (value === "error" && !withError) return null;

        const active = value === currentValue;
        const last = i === arr.length - 1;
        const disabled = !oneSuccess && withError && value !== "error";

        return (
          <Tabs.Trigger
            key={value}
            value={value}
            className={classNames(
              "text-sm",
              "px-2 py-1",
              "rounded-lg",
              "transition-all",
              "relative",
              "flex flex-col items-center",
              "w-[calc(25%-.25rem)]",
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
              !active &&
                !disabled &&
                "hover:bg-brand-main/5 hover:after:opacity-100",
            )}
            data-text={names[value]}
            disabled={disabled}
          >
            <span className="truncate w-full">{names[value]}</span>
          </Tabs.Trigger>
        );
      })}
      <span
        className={classNames(
          "h-[2px] rounded-[1px]",
          "block",
          "absolute bottom-0 left-0",
          "bg-buttonaccent",
          "transition-all",
          "w-[calc(25%-.3125rem)]",
        )}
        style={{
          left: `calc(.25rem + ${activeIndex * 25}% - ${
            activeIndex * 0.0625
          }rem)`,
        }}
      />
    </Tabs.List>
  );
};

export default TabsHeader;
