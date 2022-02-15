import { FC } from "react";
import classNames from "clsx";

type AddAccountHeaderProps = {
  className?: string;
};

const AddAccountHeader: FC<AddAccountHeaderProps> = ({
  className,
  children,
}) => (
  <h1
    className={classNames(
      "w-full",
      "text-[2rem] font-bold text-center",
      className
    )}
  >
    {children}
  </h1>
);

export default AddAccountHeader;
