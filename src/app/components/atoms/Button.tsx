import classNames from "clsx";

type ButtonProps = React.HTMLAttributes<HTMLButtonElement>;

const Button: React.FC<ButtonProps> = ({ className, ...rest }) => (
  <button
    className={classNames(
      "bg-blue-500 hover:bg-blue-700",
      "border border-blue-700",
      "rounded",
      "py-2 px-4",
      "text-white font-bold",
      className
    )}
    {...rest}
  />
);

export default Button;
