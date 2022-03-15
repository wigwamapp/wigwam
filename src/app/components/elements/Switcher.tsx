import { FC } from "react";
import classNames from "clsx";
import * as SwitchPrimitive from "@radix-ui/react-switch";

interface SwitcherProps {
  id?: string;
  label?: string;
  text: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
}

const Switcher: FC<SwitcherProps> = ({
  id = "switcher",
  label,
  text,
  checked,
  onCheckedChange,
  className,
}) => (
  <div className={classNames("flex flex-col", className)}>
    {label && (
      <label
        className={classNames(
          "ml-4 mb-2",
          "text-base font-normal",
          "text-brand-gray",
          "cursor-pointer"
        )}
        htmlFor={id}
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
        "min-h-[2.75rem] py-2 px-5",
        "bg-brand-main/[.05]",
        "rounded-[.625rem]",
        "transition-colors",
        "hover:bg-brand-main/10 focus-visible:bg-brand-main/10"
      )}
    >
      <span className="text-sm font-bold">{text}</span>
      <span
        className={classNames(
          "flex items-center",
          "w-11 h-[1.625rem] p-[.1875rem]",
          "rounded-full",
          "border border-brand-light",
          "transition-colors",
          !checked ? "bg-brand-main/[.05]" : "bg-brand-main/20"
        )}
      >
        <SwitchPrimitive.SwitchThumb
          className={classNames(
            "block",
            "w-[1.125rem] h-[1.125rem]",
            "rounded-full",
            "bg-brand-light",
            "transition-transform",
            checked && "translate-x-[1.125rem]"
          )}
        />
      </span>
    </SwitchPrimitive.Root>
  </div>
);

export default Switcher;