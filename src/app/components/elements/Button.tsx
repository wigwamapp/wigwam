import { FC, HTMLAttributes } from "react";
import classNames from "clsx";

type ButtonProps = HTMLAttributes<HTMLButtonElement>;

const Button: FC<ButtonProps> = ({ className, ...rest }) => (
  <button
    className={classNames(
      "inline-flex p-4 text-gray-300 hover:text-gray-100 text-2xl",
      "transition ease-in-out duration-200",
      className
    )}
    {...rest}
  />
);

export default Button;
