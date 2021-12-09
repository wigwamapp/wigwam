import { FC, HTMLAttributes } from "react";
import classNames from "clsx";
import Link, { LinkProps } from "lib/navigation/Link";

type NewButtonProps = {
  Icon: FC<{ className?: string }>;
  theme?: "primary" | "secondary";
} & (HTMLAttributes<HTMLButtonElement> | LinkProps);

const NewButton: FC<NewButtonProps> = ({
  theme = "primary",
  className,
  Icon,
  ...rest
}) => {
  const classNamesList = classNames(
    "group",
    theme === "primary" && "w-5 h-5",
    theme === "secondary" && "w-6 h-6",
    theme === "primary" && "bg-brand-main/20",
    "rounded",
    "flex justify-center items-center",
    "transition",
    "hover:bg-brand-main/30 hover:shadow-buttonsecondary",
    "focus:bg-brand-main/30 focus:shadow-buttonsecondary",
    "active:bg-brand-main/20 active:shadow-none",
    className
  );

  const content = (
    <Icon
      className={classNames(
        theme === "primary" && "w-4 h-4",
        theme === "secondary" && "w-6 h-6",
        "transition-opacity",
        "group-active:opacity-60"
      )}
    />
  );

  if ("href" in rest) {
    return (
      <a
        target="_blank"
        rel="nofollow noreferrer"
        className={classNamesList}
        {...rest}
      >
        {content}
      </a>
    );
  }

  if ("to" in rest) {
    return (
      <Link className={classNamesList} {...rest}>
        {content}
      </Link>
    );
  }

  return (
    <button className={classNamesList} {...rest}>
      {content}
    </button>
  );
};

export default NewButton;
