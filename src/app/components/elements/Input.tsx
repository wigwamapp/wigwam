import React, {
  FC,
  forwardRef,
  HTMLProps,
  memo,
  ReactNode,
  useCallback,
  useState,
} from "react";
import classNames from "clsx";
import NumberFormat from "react-number-format";

export type InputProps = {
  className?: string;
  label?: string;
  StartAdornment?: FC<{ className?: string }>;
  EndAdornment?: FC<{ className?: string }>;
  theme?: "primary" | "clean";
  optional?: boolean;
  error?: boolean;
  errorMessage?: string;
  inputClassName?: string;
  adornmentClassName?: string;
  labelActions?: ReactNode;
  actions?: ReactNode;
} & HTMLProps<HTMLInputElement>;

const Input = memo(
  forwardRef<HTMLInputElement, InputProps>(
    (
      {
        className,
        label,
        id,
        name,
        StartAdornment,
        EndAdornment,
        disabled,
        theme = "primary",
        error,
        errorMessage,
        inputClassName,
        adornmentClassName,
        optional,
        labelActions,
        actions,
        onFocus,
        onBlur,
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
        disabled && "fill-current text-brand-disabledcolor",
        adornmentClassName
      );

      const handleFocus = useCallback(
        (evt) => {
          setFocused(true);
          onFocus?.(evt);
        },
        [onFocus]
      );

      const handleBlur = useCallback(
        (evt) => {
          setFocused(false);
          onBlur?.(evt);
        },
        [onBlur]
      );

      const props = {
        id: id ?? name,
        name: name,
        className: classNames(
          "w-full",
          "py-3 px-4",
          !!StartAdornment && "pl-10",
          (!!EndAdornment || !!actions) && "pr-10",
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
          focused && "!bg-brand-main/[.05] !border-brand-main/[.15]",
          disabled && [
            "bg-brand-disabledbackground/20",
            "border-brand-main/5",
            "text-brand-disabledcolor placeholder-brand-disabledcolor",
          ],
          error && "!border-brand-redobject",
          inputClassName
        ),
        onFocus: handleFocus,
        onBlur: handleBlur,
        disabled: disabled,
        ...rest,
      };
      return (
        <div className={classNames("flex flex-col text-base", className)}>
          {(label || labelActions || optional) && (
            <div className="flex justify-between items-center mx-4 mb-2">
              {label && (
                <label
                  htmlFor={id ?? name}
                  className="cursor-pointer text-brand-gray"
                >
                  {label}
                </label>
              )}
              {labelActions}
              {optional && !labelActions && (
                <span className="text-xs text-brand-inactivedark2 self-end">
                  optional
                </span>
              )}
            </div>
          )}
          <div className="group relative">
            {!!StartAdornment && (
              <StartAdornment
                className={classNames(adornmentClassNames, "left-4")}
              />
            )}

            <input ref={ref} {...props} />
            {/* <UseElement
              El={
                rest.type !== "number"
                  ? ({ ...rest }) => <input {...rest} />
                  : ({ ...rest }) => <NumberFormat {...rest} />
              }
              ref={ref}
              id={id ?? name}
              name={name}
              className={classNames(
                "w-full",
                "py-3 px-4",
                !!StartAdornment && "pl-10",
                (!!EndAdornment || !!actions) && "pr-10",
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
                focused && "!bg-brand-main/[.05] !border-brand-main/[.15]",
                disabled && [
                  "bg-brand-disabledbackground/20",
                  "border-brand-main/5",
                  "text-brand-disabledcolor placeholder-brand-disabledcolor",
                ],
                error && "!border-brand-redobject",
                inputClassName
              )}
              onFocus={handleFocus}
              onBlur={handleBlur}
              disabled={disabled}
              {...rest}
            /> */}
            {!!EndAdornment && !actions && (
              <EndAdornment
                className={classNames(adornmentClassNames, "right-4")}
              />
            )}
            {!!actions && (
              <span className="absolute top-1/2 -translate-y-1/2 right-3">
                {actions}
              </span>
            )}
          </div>
          <div
            className={classNames(
              "max-h-0 overflow-hidden",
              "transition-[max-height] duration-200",
              error && errorMessage && "max-h-5"
            )}
          >
            <span className="text-brand-redtext pt-1 pl-4 text-xs">
              {errorMessage}
            </span>
          </div>
        </div>
      );
    }
  )
);

/* type UseElementProps = {
  El: React.FC<>;
} & Record<string, unknown>;

const UseElement: FC<UseElementProps> = React.forwardRef(
  ({ El, ...rest }, ref) => {
    console.log(`El`, El);
    console.log(`rest `, rest);
    return <El ref={ref} {...rest}></El>;
  }
); */

export default Input;
