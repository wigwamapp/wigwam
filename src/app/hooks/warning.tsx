import { createContext, FC, useContext, useState } from "react";

import { SecondaryModalProps } from "app/components/elements/SecondaryModal";

type WarningContextDataProps =
  | (Omit<SecondaryModalProps, "header" | "open" | "onOpenChange"> & {
      header: string;
      primaryButtonText: string;
      onPrimaryButtonClick?: () => void;
      secondaryButtonText?: string;
      onSecondaryButtonClick?: () => void;
    })
  | null;

type WarningContextProps = {
  modalData: WarningContextDataProps;
  setModalData: (value: WarningContextDataProps) => void;
};

const defaultWarningContextData = {
  modalData: null,
  setModalData: () => undefined,
};

export const warningContext = createContext<WarningContextProps>(
  defaultWarningContextData
);

const WarningProvider: FC = ({ children }) => {
  const [modalData, setModalData] = useState<WarningContextDataProps>(null);

  return (
    <warningContext.Provider value={{ modalData, setModalData }}>
      {children}
    </warningContext.Provider>
  );
};

export default WarningProvider;

export const useWarning = () => {
  return useContext(warningContext);
};
