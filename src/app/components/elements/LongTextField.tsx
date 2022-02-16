import { memo, forwardRef, TextareaHTMLAttributes } from "react";
import classNames from "clsx";

export type LongTextFieldProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

const LongTextField = memo(
  forwardRef<HTMLTextAreaElement, LongTextFieldProps>(
    ({ spellCheck = false, className, disabled, ...rest }, ref) => {
      return (
        <textarea
          ref={ref}
          spellCheck={spellCheck}
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
            className
          )}
          {...rest}
        />
      );
    }
  )
);

export default LongTextField;
