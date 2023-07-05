import { FC, PropsWithChildren } from "react";
import classNames from "clsx";

type SettingsHeaderProps = PropsWithChildren<{
  className?: string;
}>;

const SettingsHeader: FC<SettingsHeaderProps> = ({ className, children }) => (
  <h3
    className={classNames("font-bold text-2xl leading-none", "mb-6", className)}
  >
    {children}
  </h3>
);

export default SettingsHeader;
