import { ButtonHTMLAttributes, FC } from "react";
import classNames from "clsx";

type InputLabelAction = ButtonHTMLAttributes<HTMLButtonElement>;

const InputLabelAction: FC<InputLabelAction> = ({
  type = "button",
  className,
  children,
  ...rest
}) => (
  <button
    type={type}
    className={classNames(
      "py-1 px-3",
      "bg-brand-main/10",
      "rounded-md",
      "text-xs font-bold",
      "transition-colors",
      "hover:bg-brand-main/30 hover:shadow-buttonsecondary",
      "focus-visible:bg-brand-main/30 focus-visible:shadow-buttonsecondary",
      "active:bg-brand-main/20 active:shadow-none",
      className,
    )}
    {...rest}
  >
    {children}
  </button>
);

export default InputLabelAction;
