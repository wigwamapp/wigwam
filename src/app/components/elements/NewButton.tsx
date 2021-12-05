import { FC, HTMLAttributes } from "react";
import classNames from "clsx";

type NewButtonProps = {
  theme?: "primary" | "secondary" | "tertiary";
} & HTMLAttributes<HTMLButtonElement>;

const NewButton: FC<NewButtonProps> = ({
  theme = "primary",
  className,
  ...rest
}) => (
  <button
    className={classNames(
      "py-3 px-4 min-w-[10rem]",
      "text-brand-light text-base font-bold",
      "rounded-[.375rem]",
      "transition",
      theme === "primary" && [
        "bg-buttonaccent bg-opacity-90",
        "hover:bg-opacity-100 hover:shadow-buttonaccent",
        "focus:bg-opacity-100 focus:shadow-buttonaccent",
        "active:bg-opacity-70 active:shadow-none",
      ],
      theme === "secondary" && "bg-brand-main bg-opacity-10",
      (theme === "secondary" || theme === "tertiary") && [
        "hover:bg-brand-darklight hover:bg-opacity-100 hover:shadow-buttonsecondary",
        "focus:bg-brand-darklight focus:bg-opacity-100 focus:shadow-buttonsecondary",
        "active:bg-brand-main active:text-brand-light/60 active:bg-opacity-10 active:shadow-none",
      ],
      className
    )}
    {...rest}
  />
);

export default NewButton;
