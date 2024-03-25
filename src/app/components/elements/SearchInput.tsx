import { FC, forwardRef, HTMLProps } from "react";
import classNames from "clsx";

import Input from "app/components/elements/Input";
import IconedButton from "app/components/elements/IconedButton";
import { ReactComponent as SearchIcon } from "app/icons/search-input.svg";
import { ReactComponent as ClearIcon } from "app/icons/close.svg";

type SearchInputProps = Omit<
  HTMLProps<HTMLInputElement>,
  "value" | "onChange" | "ref" | "size"
> & {
  searchValue?: string | null;
  toggleSearchValue?: (value: string | null) => void;
  size?: "large" | "small";
  StartAdornment?: FC<{ className?: string }>;
  inputClassName?: string;
  adornmentClassName?: string;
};

const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      searchValue,
      toggleSearchValue,
      placeholder = "Type name or address to search...",
      size = "large",
      StartAdornment = SearchIcon,
      className,
      inputClassName,
      adornmentClassName,
      ...rest
    },
    ref,
  ) => (
    <Input
      ref={ref}
      placeholder={placeholder}
      StartAdornment={StartAdornment}
      value={searchValue ?? ""}
      onChange={
        toggleSearchValue
          ? (e) => {
              e.preventDefault();
              toggleSearchValue(e.currentTarget.value);
            }
          : undefined
      }
      className={classNames("w-full", className)}
      inputClassName={classNames(
        size === "large" && "max-h-10 text-sm",
        size === "small" && "max-h-7 !pr-5 !py-2 text-xs !rounded-md",
        inputClassName,
      )}
      adornmentClassName={classNames(
        size === "small" && "!w-4 !h-4",
        adornmentClassName,
      )}
      actions={
        searchValue ? (
          <IconedButton
            theme="tertiary"
            Icon={ClearIcon}
            aria-label="Clear"
            onClick={() => toggleSearchValue?.(null)}
            className={classNames(
              size === "small" ? "!w-4 !h-4" : "",
              !searchValue && "hidden",
            )}
            iconClassName={classNames(size === "small" ? "!w-4 !h-4" : "")}
            tooltipProps={{ missSingleton: true }}
          />
        ) : undefined
      }
      actionsClassName={classNames(size === "small" ? "!right-1.5" : "")}
      {...rest}
    />
  ),
);

export default SearchInput;
