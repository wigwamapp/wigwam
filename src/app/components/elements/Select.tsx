import { ReactElement, useState } from "react";
import classNames from "clsx";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

import ScrollAreaContainer from "app/components/elements/ScrollAreaContainer";
import SearchInput from "app/components/elements/SearchInput";
import { ReactComponent as ChevronDownIcon } from "app/icons/chevron-down.svg";
import { ReactComponent as SelectedIcon } from "app/icons/SelectCheck.svg";

type ItemProps<T, U> = {
  icon?: string;
  key: U;
  value: T;
};

type SelectProps<T, U> = {
  items: ItemProps<T, U>[];
  currentItem: ItemProps<T, U>;
  setItem: (itemKey: ItemProps<T, U>) => void;
  label?: string;
  searchValue?: string | null;
  onSearch?: (value: string | null) => void;
  showSelected?: boolean;
  showSelectedIcon?: boolean;
  itemRef?: any;
  loadMoreOnItemFromEnd?: number;
  className?: string;
  contentClassName?: string;
  scrollAreaClassName?: string;
  currentItemClassName?: string;
  currentItemIconClassName?: string;
} & DropdownMenu.DropdownMenuProps;

function Select<T extends string | ReactElement, U extends string | number>({
  items,
  currentItem,
  setItem,
  label,
  searchValue,
  onSearch,
  showSelected = false,
  showSelectedIcon = true,
  modal = true,
  itemRef,
  loadMoreOnItemFromEnd = 1,
  className,
  contentClassName,
  scrollAreaClassName,
  currentItemClassName,
  currentItemIconClassName,
  ...rest
}: SelectProps<T, U>) {
  const [opened, setOpened] = useState(false);

  return (
    <div className={classNames("flex flex-col min-w-[17.75rem]", className)}>
      {!!label && (
        <button
          type="button"
          className={classNames(
            "ml-4 mb-2",
            "text-base font-normal text-left",
            "text-brand-gray"
          )}
          onClick={() => setOpened(!opened)}
        >
          {label}
        </button>
      )}
      <DropdownMenu.Root
        open={opened}
        onOpenChange={() => setOpened(!opened)}
        modal={modal}
        {...rest}
      >
        <DropdownMenu.Trigger
          className={classNames(
            "flex items-center",
            "w-full",
            "py-2.5 px-5",
            "text-sm font-bold",
            "bg-brand-main/5",
            "rounded-[.625rem]",
            "hover:bg-brand-main/10 focus-visible:bg-brand-main/10",
            {
              "bg-brand-main/10": opened,
            },
            "transition-colors",
            currentItemClassName
          )}
        >
          {currentItem.icon && (
            <img
              src={currentItem.icon}
              alt={
                typeof currentItem.value === "string"
                  ? currentItem.value
                  : "Icon"
              }
              className={classNames("w-7 mr-2", currentItemIconClassName)}
            />
          )}
          {currentItem.value}
          <ChevronDownIcon
            className={classNames(
              "min-w-[1.5rem]",
              "ml-auto",
              "transition-transform",
              {
                "rotate-180": opened,
              }
            )}
          />
        </DropdownMenu.Trigger>
        <DropdownMenu.Content
          className={classNames(
            "shadow-xs",
            "focus-visible:outline-none",
            "mt-2",
            "w-full min-w-[17.75rem]",
            "rounded-[.625rem]",
            "bg-brand-dark/10",
            "backdrop-blur-[30px]",
            "border border-brand-light/5",
            "z-10",
            contentClassName
          )}
        >
          {!!onSearch && (
            <div
              className={classNames(
                "relative",
                "p-3",
                "after:absolute after:bottom-0 after:left-3",
                "after:w-[calc(100%-1.5rem)] after:h-[1px]",
                "after:bg-brand-main/[.07]"
              )}
            >
              <SearchInput
                placeholder="Type name to search..."
                searchValue={searchValue}
                toggleSearchValue={(value) => {
                  onSearch(value);
                }}
                inputClassName="max-h-9 !pl-9"
                adornmentClassName="!left-3"
              />
            </div>
          )}
          <ScrollAreaContainer
            viewportAsChild
            className={classNames(
              "max-h-64 pl-3 pr-4",
              "flex flex-col",
              scrollAreaClassName
            )}
            viewPortClassName="py-3 !flex flex-col"
            scrollBarClassName="py-3"
          >
            <div>
              {items
                .filter((item) =>
                  showSelected ? item.key : item.key !== currentItem.key
                )
                .map((item, i) => (
                  <DropdownMenu.Item
                    ref={
                      i === items.length - loadMoreOnItemFromEnd - 1
                        ? itemRef
                        : null
                    }
                    key={item.key}
                    className={classNames(
                      "w-full mb-1 last:mb-0",
                      "flex items-center",
                      "px-3",
                      showSelected &&
                        showSelectedIcon &&
                        item.key === currentItem.key
                        ? "py-1.5"
                        : "py-2",
                      // showSelected &&
                      //   item.key === currentItem.key &&
                      //   "!bg-brand-main/10", // Test this variant
                      "rounded-[.625rem]",
                      "cursor-pointer",
                      "text-sm font-bold",
                      "outline-none",
                      "transition-colors",
                      "hover:bg-brand-main/20 focus-visible:bg-brand-main/20"
                    )}
                    onSelect={() => {
                      setOpened(false);
                      setItem(item);
                      if (onSearch) {
                        onSearch(null);
                      }
                    }}
                    textValue={!!onSearch ? "" : undefined}
                    asChild
                  >
                    <button>
                      {item.icon && (
                        <img
                          src={item.icon}
                          alt={
                            typeof item.value === "string" ? item.value : "Icon"
                          }
                          className={"w-6 h-6 mr-3"}
                        />
                      )}
                      {item.value}
                      {showSelected &&
                        showSelectedIcon &&
                        item.key === currentItem.key && (
                          <SelectedIcon className="ml-auto" />
                        )}
                    </button>
                  </DropdownMenu.Item>
                ))}
            </div>
          </ScrollAreaContainer>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </div>
  );
}

export default Select;
