import { memo, forwardRef, TextareaHTMLAttributes, ReactNode } from "react";
import classNames from "clsx";

import Tooltip, { TooltipProps } from "./Tooltip";
import TooltipIcon from "./TooltipIcon";

export type LongTextFieldProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  labelActions?: ReactNode;
  actions?: ReactNode;
  textareaClassName?: string;
  error?: boolean;
  errorMessage?: string;
  tooltip?: ReactNode;
  tooltipProps?: TooltipProps;
};

const LongTextField = memo(
  forwardRef<HTMLTextAreaElement, LongTextFieldProps>(
    (
      {
        label,
        id,
        labelActions,
        spellCheck = false,
        actions,
        error,
        errorMessage,
        disabled,
        readOnly,
        tooltip,
        tooltipProps,
        className,
        textareaClassName,
        autoComplete = "off",
        ...rest
      },
      ref
    ) => {
      return (
        <div className={classNames("flex flex-col", className)}>
          {(label || labelActions) && (
            <div className="flex items-center justify-between px-4 mb-2 min-h-6">
              {label && (
                <label
                  htmlFor={id}
                  className="text-base text-brand-gray cursor-pointer flex align-center"
                >
                  {label}
                  {tooltip && (
                    <Tooltip
                      content={tooltip}
                      {...tooltipProps}
                      className="ml-2"
                    >
                      <TooltipIcon className="!w-4 !h-4" />
                    </Tooltip>
                  )}
                </label>
              )}
              {labelActions}
            </div>
          )}
          <div className="relative flex">
            <textarea
              ref={ref}
              spellCheck={spellCheck}
              id={id}
              disabled={disabled}
              readOnly={readOnly}
              className={classNames(
                "w-full h-28",
                "py-3 px-4",
                "box-border",
                "text-base leading-5 text-brand-light font-medium",
                "bg-black/20",
                "border border-brand-main/10",
                "rounded-[.625rem]",
                "outline-none",
                "transition-colors",
                "placeholder-brand-placeholder",
                "resize-none",
                error && !readOnly && "!border-brand-redobject",
                !disabled && [
                  "group-hover:bg-brand-main/5",
                  "group-hover:border-brand-main/5",
                ],
                "focus:border-brand-main/[.15]",
                disabled && [
                  "bg-brand-disabledbackground/20",
                  "border-brand-main/5",
                  "text-brand-disabledcolor placeholder-brand-disabledcolor",
                ],
                textareaClassName
              )}
              autoComplete={autoComplete}
              {...rest}
            />
            {actions}
          </div>
          <div
            className={classNames(
              "max-h-0 overflow-hidden",
              "transition-[max-height] duration-200",
              error && errorMessage && !readOnly && "max-h-5"
            )}
          >
            <span className="block text-brand-redtext text-left pt-1 pl-4 text-xs">
              {errorMessage}
            </span>
          </div>
        </div>
      );
    }
  )
);

export default LongTextField;
