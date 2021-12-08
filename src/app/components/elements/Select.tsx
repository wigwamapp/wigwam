import { FC } from "react";
import classNames from "clsx";
import { Listbox, Transition } from "@headlessui/react";

import { ReactComponent as ChevronDownIcon } from "app/icons/chevron-down.svg";

import ScrollAreaContainer from "./ScrollAreaContainer";

type ItemProps = {
  icon?: string;
  key: any; // TODO: Change to string | number
  value: string;
};

type SelectProps = {
  items: ItemProps[];
  currentItem: ItemProps;
  setItem: (item: ItemProps) => void;
  className?: string;
};

const Select: FC<SelectProps> = ({
  items,
  currentItem,
  setItem,
  className,
}) => (
  <Listbox
    as="div"
    className={classNames("space-y-1", className)}
    value={currentItem}
    onChange={(item) => setItem(item)}
  >
    {({ open }) => (
      <div className="relative max-w-[17.75rem]">
        <Listbox.Button
          className={classNames(
            "flex items-center",
            "min-h-[2.875rem]",
            "min-w-[17.75rem]",
            "py-2 px-5",
            "text-sm font-bold",
            "bg-brand-main/5",
            "rounded-[.625rem]",
            "hover:bg-brand-main/10",
            {
              "bg-brand-main/10": open,
            },
            "transition-colors"
          )}
        >
          {currentItem.icon && (
            <img
              src={currentItem.icon}
              alt={currentItem.value}
              className={"w-7 mr-2"}
            />
          )}
          {currentItem.value}
          <ChevronDownIcon
            className={classNames("ml-auto", "transition-transform", {
              "rotate-180": open,
            })}
          />
        </Listbox.Button>

        <Transition
          show={open}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          className={classNames(
            "absolute",
            "mt-2",
            "w-full",
            "rounded-[.625rem]",
            "bg-brand-dark/10",
            "backdrop-blur-[20px]",
            "border border-brand-light/5",
            "z-10"
          )}
        >
          <Listbox.Options
            static
            as={ScrollAreaContainer}
            className={classNames(
              "h-64 pl-3 pr-4",
              "leading-6",
              "shadow-xs",
              "focus:outline-none"
            )}
            viewPortClassName="py-3"
            scrollBarClassName="py-3"
          >
            {items
              .filter((item) => item.key !== currentItem.key)
              .map((item) => (
                <Listbox.Option
                  key={item.key}
                  value={item}
                  as="button"
                  className="w-full mb-1 last:mb-0"
                >
                  {({ active }) => (
                    <div
                      className={classNames(
                        "flex items-center",
                        "py-2 px-3",
                        "rounded-[.625rem]",
                        "cursor-pointer",
                        "text-sm font-bold",
                        {
                          "bg-brand-main/20": active,
                        },
                        "focus:bg-brand-main/20",
                        "transition-colors"
                      )}
                    >
                      {item.icon && (
                        <img
                          src={item.icon}
                          alt={item.value}
                          className={"w-6 h-6 mr-3"}
                        />
                      )}
                      {item.value}
                    </div>
                  )}
                </Listbox.Option>
              ))}
          </Listbox.Options>
        </Transition>
      </div>
    )}
  </Listbox>
);

export default Select;
