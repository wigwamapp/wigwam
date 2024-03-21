import { FC, ReactNode } from "react";
import classNames from "clsx";
import * as SwitchPrimitive from "@radix-ui/react-switch";

interface SwitcherProps {
  id?: string;
  label?: ReactNode;
  text?: ReactNode;
  checked: boolean;
  onCheckedChange?: (checked: boolean) => void;
  className?: string;
  buttonClassName?: string;
  disabled?: boolean;
  size?: "large" | "small";
}

const Switcher: FC<SwitcherProps> = ({
  id = "switcher",
  label,
  text,
  checked,
  disabled,
  onCheckedChange,
  className,
  buttonClassName,
  size = "large",
}) => (
  <div className={classNames("flex flex-col min-w-[17.75rem]", className)}>
    {label && (
      <label
        className={classNames(
          "mx-4 mb-2",
          "text-base font-normal",
          "text-brand-gray",
        )}
      >
        {label}
      </label>
    )}

    <SwitchPrimitive.Root
      id={id}
      checked={checked}
      onCheckedChange={onCheckedChange}
      className={classNames(
        "flex items-center justify-between",
        size === "large"
          ? "min-h-[2.75rem] py-2 px-5"
          : "min-h-[2.25rem] py-2 px-3",
        "bg-brand-main/[.05]",
        "rounded-[.625rem]",
        "transition-colors",
        "hover:bg-brand-main/10 focus-visible:bg-brand-main/10",
        buttonClassName,
      )}
      disabled={disabled}
    >
      {text ? (
        <span
          className={classNames(
            "font-bold",
            size === "large" ? "text-sm" : "text-xs",
          )}
        >
          {text}
        </span>
      ) : null}

      <span
        className={classNames(
          "flex items-center",
          size === "large"
            ? "w-11 h-[1.625rem] p-[.1875rem]"
            : "w-8 h-[1.5rem] p-[.175rem]",
          "rounded-full",
          "transition-colors",
          !checked ? "bg-[#93ACAF]" : "bg-[#80EF6E]",
        )}
      >
        <SwitchPrimitive.SwitchThumb
          className={classNames(
            "block",
            size === "large"
              ? "w-[1.3rem] h-[1.3rem]"
              : "w-[1.1rem] h-[1.1rem]",
            "rounded-full",
            "bg-[#373B45]",
            "transition-transform",
            checked &&
              (size === "large"
                ? "translate-x-[1.125rem]"
                : "translate-x-[0.5rem]"),
          )}
        />
      </span>
    </SwitchPrimitive.Root>
  </div>
);

export default Switcher;
