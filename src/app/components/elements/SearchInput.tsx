import { forwardRef, HTMLProps } from "react";
import classNames from "clsx";

import Input from "app/components/elements/Input";
import IconedButton from "app/components/elements/IconedButton";
import { ReactComponent as SearchIcon } from "app/icons/search-input.svg";
import { ReactComponent as ClearIcon } from "app/icons/close.svg";

type SearchInput = Omit<
  HTMLProps<HTMLInputElement>,
  "value" | "onChange" | "ref"
> & {
  searchValue?: string | null;
  toggleSearchValue: (value: string | null) => void;
  inputClassName?: string;
  adornmentClassName?: string;
};

const SearchInput = forwardRef<HTMLInputElement, SearchInput>(
  (
    {
      searchValue,
      toggleSearchValue,
      placeholder = "Type name or address to search...",
      className,
      inputClassName,
      adornmentClassName,
      ...rest
    },
    ref
  ) => (
    <Input
      ref={ref}
      placeholder={placeholder}
      StartAdornment={SearchIcon}
      value={searchValue ?? ""}
      onChange={(e) => {
        e.preventDefault();
        toggleSearchValue(e.currentTarget.value);
      }}
      className={classNames("w-full", className)}
      inputClassName={classNames("max-h-10 text-sm", inputClassName)}
      adornmentClassName={adornmentClassName}
      actions={
        <IconedButton
          theme="tertiary"
          Icon={ClearIcon}
          aria-label="Clear"
          onClick={() => toggleSearchValue(null)}
          className={classNames(!searchValue && "hidden")}
        />
      }
      {...rest}
    />
  )
);

export default SearchInput;
