import { memo, forwardRef, TextareaHTMLAttributes, ReactNode } from "react";
import classNames from "clsx";

export type LongTextFieldProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  actions?: ReactNode;
  textAreaClassName?: string;
};

const LongTextField = memo(
  forwardRef<HTMLTextAreaElement, LongTextFieldProps>(
    (
      {
        label,
        id,
        actions,
        spellCheck = false,
        className,
        disabled,
        textAreaClassName,
        ...rest
      },
      ref
    ) => {
      return (
        <div className={className}>
          {(label || actions) && (
            <div className="flex items-center justify-between px-4 mb-2 min-h-6">
              {label && (
                <label
                  htmlFor={id}
                  className="text-base text-brand-gray cursor-pointer"
                >
                  {label}
                </label>
              )}
              {actions}
            </div>
          )}
          <textarea
            ref={ref}
            spellCheck={spellCheck}
            id={id}
            className={classNames(
              "w-full h-28",
              "py-3 px-4",
              "box-border",
              "text-sm text-brand-light font-medium",
              "bg-black/20",
              "border border-brand-main/10",
              "rounded-[.625rem]",
              "outline-none",
              "transition-colors",
              "placeholder-brand-placeholder",
              "resize-none",
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
              textAreaClassName
            )}
            {...rest}
          />
        </div>
      );
    }
  )
);

export default LongTextField;
