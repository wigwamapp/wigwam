import { FC } from "react";
import classNames from "clsx";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";

import { ReactComponent as CheckIcon } from "app/icons/terms-check.svg";

type CheckboxProps = {
  checked: boolean;
  className?: string;
};

const Checkbox: FC<CheckboxProps> = ({ checked, className }) => (
  <div
    className={classNames(
      "w-5 h-5",
      "bg-brand-main/20",
      "rounded",
      "flex items-center justify-center",
      checked && "border border-brand-main",
      className
    )}
  >
    <CheckboxPrimitive.Indicator>
      {checked && <CheckIcon />}
    </CheckboxPrimitive.Indicator>
  </div>
);

export default Checkbox;
