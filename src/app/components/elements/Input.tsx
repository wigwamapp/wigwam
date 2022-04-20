import {
  FC,
  forwardRef,
  HTMLProps,
  memo,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import classNames from "clsx";
import { CSSTransition } from "react-transition-group";

import { ReactComponent as SuccessIcon } from "app/icons/green-check.svg";

export type InputProps = {
  className?: string;
  label?: string;
  StartAdornment?: FC<{ className?: string }>;
  EndAdornment?: FC<{ className?: string }>;
  theme?: "primary" | "clean";
  optional?: boolean;
  error?: boolean;
  errorMessage?: string;
  success?: boolean;
  successWithIcon?: boolean;
  labelActions?: ReactNode;
  actions?: ReactNode;
  actionsClassName?: string;
  inputClassName?: string;
  adornmentClassName?: string;
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
        success,
        successWithIcon,
        inputClassName,
        adornmentClassName,
        optional,
        labelActions,
        actions,
        actionsClassName,
        onFocus,
        onBlur,
        readOnly,
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
        disabled &&
          theme !== "clean" &&
          "fill-current text-brand-disabledcolor",
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

      const successIconRef = useRef(null);

      const [isHiddenWithSuccess, setIsHiddenWithSuccess] = useState(false);

      useEffect(() => {
        if (successWithIcon) {
          const timeout = setTimeout(
            () => setIsHiddenWithSuccess(Boolean(success)),
            500
          );
          return () => clearTimeout(timeout);
        }

        return;
      }, [successWithIcon, success]);

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

            <input
              ref={ref}
              id={id ?? name}
              name={name}
              spellCheck={false}
              className={classNames(
                "w-full",
                "py-3 px-4",
                !!StartAdornment && "pl-10",
                (!!EndAdornment || !!actions) && "pr-10",
                "box-border",
                "text-brand-light leading-none",
                "border",
                (theme === "primary" ||
                  (theme === "clean" && error && !readOnly)) &&
                  "bg-black/20 border-brand-main/10",
                theme === "clean" &&
                  !(error && !readOnly) &&
                  "bg-transparent border-transparent",
                "rounded-[.625rem]",
                "outline-none",
                "transition-colors",
                "placeholder-brand-placeholder",
                !disabled &&
                  theme !== "clean" && [
                    "group-hover:bg-brand-main/5",
                    "group-hover:border-brand-main/5",
                  ],
                focused && "!bg-brand-main/[.05] !border-brand-main/[.15]",
                disabled &&
                  theme !== "clean" && [
                    "bg-brand-disabledbackground/20",
                    "border-brand-main/5",
                    "text-brand-disabledcolor placeholder-brand-disabledcolor",
                  ],
                error && !readOnly && "!border-brand-redobject",
                success && "!border-brand-greenobject",
                inputClassName
              )}
              onFocus={handleFocus}
              onBlur={handleBlur}
              disabled={disabled}
              readOnly={readOnly}
              {...rest}
            />
            {EndAdornment && !actions && (
              <EndAdornment
                className={classNames(adornmentClassNames, "right-4")}
              />
            )}
            {actions && (
              <span
                className={classNames(
                  "absolute top-1/2 -translate-y-1/2 right-3",
                  actionsClassName
                )}
              >
                {actions}
              </span>
            )}
            {success && successWithIcon && (
              <CSSTransition
                nodeRef={successIconRef}
                in={isHiddenWithSuccess}
                timeout={150}
                classNames="opacity-transition"
              >
                <span
                  ref={successIconRef}
                  className={classNames(
                    "absolute inset-px",
                    "bg-[#0a0a19]",
                    "rounded-[.625rem]",
                    "flex items-center justify-center",
                    "opacity-0"
                  )}
                >
                  <SuccessIcon />
                </span>
              </CSSTransition>
            )}
          </div>
          <div
            className={classNames(
              "max-h-0 overflow-hidden",
              "transition-[max-height] duration-200",
              error && errorMessage && !readOnly && "max-h-5"
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

export default Input;
