import {
  createContext,
  FC,
  PropsWithChildren,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";
import classNames from "clsx";
import { usePrevious } from "lib/react-hooks/usePrevious";
import { assert } from "lib/system/assert";

import Toast from "app/components/elements/Toast";

type ToastContextProps = {
  toastData: ReactNode | null;
  updateToast: (value: ReactNode | null) => void;
};

const toastContext = createContext<ToastContextProps | null>(null);

export const useToast = () => {
  const value = useContext(toastContext);
  assert(value);

  return value;
};

export const ToastProvider: FC<PropsWithChildren> = ({ children }) => {
  const [toastData, updateToast] = useState<ReactNode>(null);

  return (
    <toastContext.Provider value={{ toastData, updateToast }}>
      {children}
    </toastContext.Provider>
  );
};

type ToastOverflowProviderProps = {
  isCorner?: boolean;
  className?: string;
};

export const ToastOverflowProvider: FC<
  PropsWithChildren<ToastOverflowProviderProps>
> = ({ isCorner = false, className, children }) => {
  const { toastData, updateToast } = useToast();
  const prevToastData = usePrevious(toastData);

  useEffect(() => () => updateToast(null), [updateToast]);

  return (
    <ToastPrimitive.Provider>
      <ToastPrimitive.Viewport
        className={classNames(
          "absolute",
          isCorner ? "top-0 right-0" : "top-5 right-6",
          className,
        )}
      />
      {children}
      <Toast
        description={toastData === null ? prevToastData : toastData}
        open={Boolean(toastData)}
        onOpenChange={() => updateToast(null)}
      />
    </ToastPrimitive.Provider>
  );
};
