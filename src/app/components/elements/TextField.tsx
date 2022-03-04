import { memo, forwardRef, InputHTMLAttributes } from "react";
import classNames from "clsx";

type TextFieldProps = InputHTMLAttributes<HTMLInputElement>;

const TextField = memo(
  forwardRef<HTMLInputElement, TextFieldProps>(
    ({ type = "text", spellCheck = false, className, ...rest }, ref) => {
      return (
        <input
          ref={ref}
          type={type}
          spellCheck={spellCheck}
          className={classNames(
            "w-full bg-transparent p-4",
            "border border-white",
            "focus-visible:outline-none focus-visible:border-red-500",
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

export default TextField;
