import { FC, ReactNode } from "react";
import classNames from "clsx";
import * as Checkbox from "@radix-ui/react-checkbox";

import { ReactComponent as CheckIcon } from "app/icons/terms-check.svg";

type AcceptCheckboxProps = {
  value: boolean;
  onChange: (isInputChecked: boolean) => void;
  title: ReactNode;
  description: ReactNode;
  error?: boolean;
  errorMessage?: string;
  containerClassName?: string;
  className?: string;
};

const AcceptCheckbox: FC<AcceptCheckboxProps> = ({
  value,
  onChange,
  title,
  description,
  error,
  errorMessage,
  containerClassName,
  className,
}) => (
  <div className={classNames("relative flex flex-col", containerClassName)}>
    <Checkbox.Root
      className={classNames(
        "w-full px-3 pt-2 pb-3",
        "rounded-[.625rem]",
        "bg-brand-main/[.05]",
        "flex",
        "transition-colors",
        "hover:bg-brand-main/[.1]",
        value && "bg-brand-main/[.1]",
        "border border-transparent",
        !!error && "!border-brand-redobject",
        className,
      )}
      checked={value}
      onCheckedChange={(e) => {
        onChange(e === "indeterminate" ? false : e);
      }}
    >
      <div
        className={classNames(
          "w-5 h-5 min-w-[1.25rem] mt-0.5 mr-4",
          "bg-brand-main/20",
          "rounded",
          "flex items-center justify-center",
          value && "border border-brand-main",
          !!error && "border !border-brand-redobject",
        )}
      >
        <Checkbox.Indicator>{value && <CheckIcon />}</Checkbox.Indicator>
      </div>
      <div className="text-left">
        <h3 className="text-brand-light text-base font-semibold">{title}</h3>
        <p className="text-brand-inactivedark2 text-sm">{description}</p>
      </div>
    </Checkbox.Root>
    <div
      className={classNames(
        "flex max-h-0 overflow-hidden",
        "transition-[max-height] duration-200",
        error && errorMessage && "max-h-5",
      )}
    >
      <span className="text-brand-redtext pt-1 pl-4 text-xs">
        {errorMessage}
      </span>
    </div>
  </div>
);

export default AcceptCheckbox;
