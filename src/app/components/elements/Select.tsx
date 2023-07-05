import {
  KeyboardEventHandler,
  ReactElement,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import classNames from "clsx";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

import { IS_FIREFOX } from "app/defaults";
import { OverflowProvider } from "app/hooks";
import ScrollAreaContainer from "app/components/elements/ScrollAreaContainer";
import SearchInput from "app/components/elements/SearchInput";
import { ReactComponent as ChevronDownIcon } from "app/icons/chevron-down.svg";
import { ReactComponent as SelectedIcon } from "app/icons/SelectCheck.svg";
import { ReactComponent as NoResultsFoundIcon } from "app/icons/no-results-found.svg";
import Tooltip, { TooltipProps } from "./Tooltip";
import TooltipIcon from "./TooltipIcon";

type ItemProps<T, U> = {
  icon?: string;
  key: U;
  value: T;
};

export type SelectProps<T, U> = {
  items: ItemProps<T, U>[];
  currentItem?: ItemProps<T, U>;
  setItem: (itemKey: ItemProps<T, U>) => void;
  label?: string;
  searchValue?: string | null;
  onSearch?: (value: string | null) => void;
  actions?: ReactNode;
  showSelected?: boolean;
  showSelectedIcon?: boolean;
  itemRef?: any;
  loadMoreOnItemFromEnd?: number;
  emptySearchText?: ReactNode;
  size?: "large" | "small";
  tooltip?: ReactNode;
  tooltipProps?: TooltipProps;
  className?: string;
  contentClassName?: string;
  scrollAreaClassName?: string;
  currentItemClassName?: string;
  currentItemIconClassName?: string;
  itemClassName?: string;
} & DropdownMenu.DropdownMenuProps;

function Select<T extends string | ReactElement, U extends string | number>({
  items,
  currentItem,
  setItem,
  label,
  searchValue,
  onSearch,
  actions,
  showSelected = false,
  showSelectedIcon = true,
  modal = true,
  itemRef,
  loadMoreOnItemFromEnd = 1,
  emptySearchText,
  onOpenChange,
  size = "large",
  tooltip,
  tooltipProps,
  className,
  contentClassName,
  scrollAreaClassName,
  currentItemClassName,
  currentItemIconClassName,
  itemClassName,
  ...rest
}: SelectProps<T, U>) {
  const [opened, setOpened] = useState(false);

  const itemsRef = useRef<HTMLDivElement>(null);

  const handleSearchKeyDown = useCallback<
    KeyboardEventHandler<HTMLInputElement>
  >((evt) => {
    if (evt.key === "ArrowDown") {
      evt.preventDefault();

      const firstItem = itemsRef.current
        ?.firstElementChild as HTMLButtonElement;

      firstItem?.focus();
    }
  }, []);

  useEffect(() => {
    if (rest.open !== undefined) {
      setOpened(rest.open);
    }
  }, [rest.open]);

  const filteredItems = useMemo(
    () =>
      items.filter((item) =>
        showSelected ? item.key : item.key !== currentItem?.key
      ),
    [currentItem?.key, items, showSelected]
  );

  const handleOpenChange = useCallback(
    (opn: boolean) => {
      setOpened(opn);
      onSearch?.(null);
      onOpenChange?.(opn);
    },
    [onOpenChange, onSearch]
  );

  return (
    <div
      className={classNames(
        "flex flex-col",
        size === "large" && "min-w-[17.75rem]",
        size === "small" && "w-[12.5rem]",
        className
      )}
    >
      {!!label && (
        <button
          type="button"
          className={classNames(
            "ml-4 mb-2",
            "text-base font-normal text-left",
            "text-brand-gray",
            "flex items-center"
          )}
          onClick={() => setOpened(!opened)}
        >
          {label}
          {tooltip && (
            <Tooltip
              content={tooltip}
              {...tooltipProps}
              tooltipClassName="max-w-[20rem]"
              asChild
            >
              <span className="ml-2">
                <TooltipIcon className="!w-4 !h-4" />
              </span>
            </Tooltip>
          )}
        </button>
      )}
      <DropdownMenu.Root
        open={opened}
        modal={modal}
        onOpenChange={handleOpenChange}
        {...rest}
      >
        <DropdownMenu.Trigger
          disabled={!currentItem}
          className={classNames(
            "flex items-center",
            "w-full",
            size === "large" && "py-2.5 pl-5 pr-4 text-sm rounded-[.625rem]",
            size === "small" && "py-1.5 pl-3 pr-2 text-xs rounded-lg",
            "font-bold",
            "bg-brand-main/5",
            currentItem &&
              "hover:bg-brand-main/10 focus-visible:bg-brand-main/10",
            {
              "bg-brand-main/10": opened,
            },
            "transition-colors",
            currentItemClassName
          )}
        >
          {currentItem && (
            <>
              {currentItem.icon && (
                <img
                  src={currentItem.icon}
                  alt={
                    typeof currentItem.value === "string"
                      ? currentItem.value
                      : "Icon"
                  }
                  className={classNames(
                    size === "large" && "w-7 mr-2",
                    size === "small" && "w-4 mr-1",
                    currentItemIconClassName
                  )}
                />
              )}
              {typeof currentItem.value === "string" ? (
                <span className="min-w-0 truncate">{currentItem.value}</span>
              ) : (
                currentItem.value
              )}
              <ChevronDownIcon
                className={classNames(
                  size === "large" && "w-6 min-w-[1.5rem]",
                  size === "small" && "w-5 min-w-[1.25rem]",
                  "h-auto",
                  "ml-auto",
                  "transition-transform",
                  {
                    "rotate-180": opened,
                  }
                )}
              />
            </>
          )}
        </DropdownMenu.Trigger>
        <OverflowProvider>
          {(ref) => (
            <DropdownMenu.Content
              ref={ref}
              style={{
                width: "var(--radix-dropdown-menu-trigger-width)",
              }}
              className={classNames(
                "shadow-xs",
                "focus-visible:outline-none",
                size === "large" && "mt-2 min-w-[17.75rem]",
                size === "small" && "mt-1.5 w-[12.5rem]",
                "w-full",
                "rounded-[.625rem]",
                "bg-brand-dark/10",
                "backdrop-blur-[30px]",
                IS_FIREFOX && "!bg-[#111226]",
                "border border-brand-light/5",
                "z-20",
                contentClassName
              )}
            >
              {!!onSearch && (
                <div
                  className={classNames(
                    "relative",
                    "flex items-center",
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
                    onKeyDown={handleSearchKeyDown}
                    size={size}
                    inputClassName={classNames(
                      size === "large" && "max-h-9 !pl-9",
                      size === "small" && "max-h-7 !pl-7"
                    )}
                    adornmentClassName={classNames(
                      size === "large" && "!left-3",
                      size === "small" && "!left-2"
                    )}
                    autoFocus={true}
                  />
                  {actions}
                </div>
              )}
              <ScrollAreaContainer
                className={classNames(
                  size === "large" && "max-h-64 pl-3 pr-4",
                  size === "small" && "max-h-44 pl-1 pr-[.875rem]",
                  "flex flex-col",
                  scrollAreaClassName
                )}
                viewPortClassName={classNames(
                  size === "large" && "py-3",
                  size === "small" && "py-2",
                  "viewportBlock"
                )}
                scrollBarClassName={classNames(
                  size === "small" && "w-3.5 py-2 !px-.5",
                  size === "large" && "py-3"
                )}
              >
                <div ref={itemsRef}>
                  {filteredItems.length > 0 ? (
                    filteredItems.map((item, i) => (
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
                          size === "large" && "px-3",
                          size === "small" && "px-2",
                          showSelected &&
                            showSelectedIcon &&
                            item.key === currentItem?.key
                            ? size === "large"
                              ? "py-1.5"
                              : "py-1"
                            : size === "large"
                            ? "py-2"
                            : "py-1.5",
                          // showSelected &&
                          //   item.key === currentItem.key &&
                          //   "!bg-brand-main/10", // Test this variant
                          size === "large" && "rounded-[.625rem] text-sm",
                          size === "small" && "rounded-lg text-xs",
                          "cursor-pointer",
                          "font-bold",
                          "outline-none",
                          "transition-colors",
                          "hover:bg-brand-main/20 focus-visible:bg-brand-main/20",
                          itemClassName
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
                                typeof item.value === "string"
                                  ? item.value
                                  : "Icon"
                              }
                              className={classNames(
                                size === "large" && "w-6 h-6 mr-3",
                                size === "small" && "w-4 h-4 mr-2"
                              )}
                            />
                          )}
                          {typeof item.value === "string" ? (
                            <span className="min-w-0 truncate">
                              {item.value}
                            </span>
                          ) : (
                            item.value
                          )}
                          {showSelected &&
                            showSelectedIcon &&
                            item.key === currentItem?.key && (
                              <SelectedIcon className="w-6 min-w-[1.5rem] h-auto ml-auto" />
                            )}
                        </button>
                      </DropdownMenu.Item>
                    ))
                  ) : (
                    <span
                      className={classNames(
                        "flex flex-col items-center justify-center mx-auto",
                        "w-full h-full py-4",
                        "text-brand-inactivedark2 text-center",
                        size === "large" && "text-sm",
                        size === "small" && "text-xs"
                      )}
                    >
                      <NoResultsFoundIcon
                        className={classNames(
                          "h-auto mb-4",
                          size === "large" && "w-[3.4375rem]",
                          size === "small" && "w-[2.875rem]"
                        )}
                      />
                      <span>
                        There are no items found.
                        <br />
                        {emptySearchText ? " " : ""}
                        {emptySearchText}
                      </span>
                    </span>
                  )}
                </div>
              </ScrollAreaContainer>
            </DropdownMenu.Content>
          )}
        </OverflowProvider>
      </DropdownMenu.Root>
    </div>
  );
}

export default Select;
