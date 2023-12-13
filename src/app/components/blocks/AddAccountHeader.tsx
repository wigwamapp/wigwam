import { FC, PropsWithChildren, ReactNode } from "react";
import classNames from "clsx";

type AddAccountHeaderProps = PropsWithChildren<{
  description?: ReactNode;
  className?: string;
}>;

const AddAccountHeader: FC<AddAccountHeaderProps> = ({
  description,
  className,
  children,
}) => (
  <div className={classNames("w-full", "text-center select-none", className)}>
    <h1 className={"text-[1.75rem] font-bold"}>{children}</h1>

    {description && (
      <p
        className={classNames(
          "mt-2",
          "font-medium text-base text-brand-lightgray opacity-75",
          "text-center",
        )}
      >
        {description}
      </p>
    )}
  </div>
);

export default AddAccountHeader;
