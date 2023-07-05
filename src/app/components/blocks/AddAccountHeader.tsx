import { FC, PropsWithChildren } from "react";
import classNames from "clsx";

type AddAccountHeaderProps = PropsWithChildren<{
  description?: string;
  className?: string;
}>;

const AddAccountHeader: FC<AddAccountHeaderProps> = ({
  description,
  className,
  children,
}) => (
  <div className={classNames("w-full", "text-center", className)}>
    <h1 className={"text-[2rem] font-bold"}>{children}</h1>
    {!!description && <p className="text-xl">{description}</p>}
  </div>
);

export default AddAccountHeader;
