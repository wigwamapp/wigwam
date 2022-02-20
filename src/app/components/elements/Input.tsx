import { FC, forwardRef, HTMLProps, memo, useState } from "react";
import classNames from "clsx";

type InputProps = {
  className?: string;
  label?: string;
  StartAdornment?: FC<{ className?: string }>;
  EndAdornment?: FC<{ className?: string }>;
  theme?: "primary" | "clean";
  inputClassName?: string;
} & HTMLProps<HTMLInputElement>;

const Input = memo(
  forwardRef<HTMLInputElement, InputProps>(
    (
      {
        className,
        label,
        id,
        StartAdornment,
        EndAdornment,
        disabled,
        theme = "primary",
        inputClassName,
        ...rest
      },
      ref
    ) => {
      const [focused, setFocused] = useState<boolean>(false);

      const adornmentClassNames = classNames(
        "w-5 h-5",
        "absolute top-1/2 -translate-y-1/2",
        "pointer-events-none",
        "transition-colors",
        focused && "fill-current text-brand-light",
        disabled && "fill-current text-brand-disabledcolor"
      );

      return (
        <div className={classNames("group flex flex-col text-base", className)}>
          {label && (
            <label
              htmlFor={id}
              className="mx-4 mb-2 cursor-pointer text-brand-gray"
            >
              {label}
            </label>
          )}
          <div className="relative">
            {!!StartAdornment && (
              <StartAdornment
                className={classNames(adornmentClassNames, "left-4")}
              />
            )}
            <input
              ref={ref}
              id={id}
              className={classNames(
                "w-full",
                "py-3 px-4",
                !!StartAdornment && "pl-10",
                !!EndAdornment && "pr-10",
                "box-border",
                "text-brand-light leading-none",
                "border",
                theme === "primary" && "bg-black/20 border-brand-main/10",
                theme === "clean" && "bg-transparent border-transparent",
                "rounded-[.625rem]",
                "outline-none",
                "transition-colors",
                "placeholder-brand-placeholder",
                !disabled && [
                  "group-hover:bg-brand-main/5",
                  "group-hover:border-brand-main/5",
                ],
                focused && "!bg-brand-main/5 !border-brand-main/[.15]",
                disabled && [
                  "bg-brand-disabledbackground/20",
                  "border-brand-main/5",
                  "text-brand-disabledcolor placeholder-brand-disabledcolor",
                ],
                inputClassName
              )}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              disabled={disabled}
              {...rest}
            />
            {!!EndAdornment && (
              <EndAdornment
                className={classNames(adornmentClassNames, "right-4")}
              />
            )}
          </div>
        </div>
      );
    }
  )
);

export default Input;
