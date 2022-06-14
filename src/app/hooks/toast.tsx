import { createContext, FC, ReactNode, useContext, useState } from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { usePrevious } from "lib/react-hooks/usePrevious";
import { assert } from "lib/system/assert";

import Toast from "app/components/elements/Toast";

type ToastContextProps = {
  toastData: ReactNode | null;
  openToast: (value: ReactNode | null) => void;
};

const toastContext = createContext<ToastContextProps | null>(null);

export const useToast = () => {
  const value = useContext(toastContext);
  assert(value);

  return value;
};

export const ToastProvider: FC = ({ children }) => {
  const [toastData, openToast] = useState<ReactNode | null>(null);

  return (
    <toastContext.Provider value={{ toastData, openToast }}>
      {children}
    </toastContext.Provider>
  );
};

export const ToastOverflowProvider: FC = ({ children }) => {
  const { toastData, openToast } = useToast();
  const prevToastData = usePrevious(toastData);

  return (
    <ToastPrimitive.Provider>
      <ToastPrimitive.Viewport className="absolute top-5 right-6" />
      {children}
      <Toast
        description={toastData === null ? prevToastData : toastData}
        open={Boolean(toastData)}
        onOpenChange={() => openToast(null)}
      />
    </ToastPrimitive.Provider>
  );
};
