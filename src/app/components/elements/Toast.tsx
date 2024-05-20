import { FC, ReactNode } from "react";
import classNames from "clsx";
import * as ToastPrimitive from "@radix-ui/react-toast";

import { ReactComponent as CloseIcon } from "app/icons/toast-close.svg";
import { ReactComponent as SuccessIcon } from "app/icons/toast-success.svg";

type ToastProps = {
  description: ReactNode;
} & ToastPrimitive.ToastProps;

const Toast: FC<ToastProps> = ({ description, ...rest }) => {
  return (
    <ToastPrimitive.Root
      className={classNames(
        "toast",
        "w-80",
        "p-4",
        "rounded-[.625rem]",
        "bg-[#13191F]",
        "border border-brand-main/[.15]",
        "text-brand-light text-sm",
        "flex items-start",
        "relative",
        "z-10",
      )}
      {...rest}
    >
      <ToastPrimitive.Description className="flex mr-2">
        <SuccessIcon className="w-6 h-6 min-w-[1.5rem] mr-2" />
        <span className="mt-0.5">{description}</span>
      </ToastPrimitive.Description>
      <ToastPrimitive.Close className="ml-auto">
        <CloseIcon className="w-6 h-6" />
      </ToastPrimitive.Close>
    </ToastPrimitive.Root>
  );
};

export default Toast;
