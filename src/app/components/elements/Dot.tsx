import { FC } from "react";
import classNames from "clsx";

const Dot: FC<{ className?: string }> = ({ className }) => (
  <span
    className={classNames("flex items-center justify-center p-2", className)}
  >
    <span className="w-1 h-1 bg-brand-inactivedark rounded-full" />
  </span>
);

export default Dot;
