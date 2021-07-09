import { memo, forwardRef, TextareaHTMLAttributes } from "react";
import classNames from "clsx";

type LongTextFieldProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

const LongTextField = memo(
  forwardRef<HTMLTextAreaElement, LongTextFieldProps>(
    ({ spellCheck = false, className, ...rest }, ref) => {
      return (
        <textarea
          ref={ref}
          spellCheck={spellCheck}
          className={classNames(
            "w-full bg-transparent p-4",
            "border border-white",
            "focus:outline-none focus:border-red-500",
            "text-lg text-white",
            "transition ease-in-out duration-300",
            className
          )}
          {...rest}
        />
      );
    }
  )
);

export default LongTextField;
