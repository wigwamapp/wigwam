import {
  createContext,
  FC,
  ReactNode,
  useCallback,
  useContext,
  useRef,
} from "react";
import useForceUpdate from "use-force-update";
import { assert } from "lib/system/assert";

import { SecondaryModalProps } from "app/components/elements/SecondaryModal";

type WarningContextDataProps =
  | (Omit<SecondaryModalProps, "header" | "open" | "onOpenChange"> & {
      header: ReactNode;
      primaryButtonText: ReactNode;
      onPrimaryButtonClick?: () => void;
      secondaryButtonText?: ReactNode;
      onSecondaryButtonClick?: () => void;
      onClose?: () => void;
    })
  | null;

type AlertParams = {
  title: ReactNode;
  content: ReactNode;
  okButtonText?: ReactNode;
};

type ConfirmParams = {
  title: ReactNode;
  content: ReactNode;
  yesButtonText?: ReactNode;
  noButtonText?: ReactNode;
};

type WarningContextProps = {
  modalData: WarningContextDataProps;
  addDialog: (params: WarningContextDataProps) => void;
  closeCurrentDialog: () => void;
  alert: (params: AlertParams) => Promise<void>;
  confirm: (params: ConfirmParams) => Promise<boolean>;
};

export const warningContext = createContext<WarningContextProps | null>(null);

export const useWarning = () => {
  const value = useContext(warningContext);
  assert(value);

  return value;
};

export const WarningProvider: FC = ({ children }) => {
  const forceUpdate = useForceUpdate();

  const queueRef = useRef<WarningContextDataProps[]>([]);
  const openedRef = useRef(false);

  const addDialog = useCallback(
    (params: WarningContextDataProps) => {
      queueRef.current.push(params);

      if (queueRef.current.length === 1) {
        openedRef.current = true;
      }

      forceUpdate();
    },
    [forceUpdate]
  );

  const closeCurrentDialog = useCallback(
    (openNextDelay = 300) => {
      if (!openedRef.current) return;

      queueRef.current.shift();
      openedRef.current = false;

      if (queueRef.current.length > 0) {
        setTimeout(() => {
          openedRef.current = true;
          forceUpdate();
        }, openNextDelay);
      }

      forceUpdate();
    },
    [forceUpdate]
  );

  const modalData = openedRef.current ? queueRef.current[0] : null;

  const alert = useCallback(
    ({ title, content, okButtonText = "OK" }: AlertParams) =>
      new Promise<void>((res) => {
        const handleDone = () => {
          closeCurrentDialog();
          res();
        };

        addDialog({
          header: title,
          children: content,
          primaryButtonText: okButtonText,
          onPrimaryButtonClick: handleDone,
          onClose: handleDone,
        });
      }),
    [addDialog, closeCurrentDialog]
  );

  const confirm = useCallback(
    ({
      title,
      content,
      yesButtonText = "OK",
      noButtonText = "Cancel",
    }: ConfirmParams) =>
      new Promise<boolean>((res) => {
        const handleConfirm = (confirmed: boolean) => {
          closeCurrentDialog();
          res(confirmed);
        };

        addDialog({
          header: title,
          children: content,
          primaryButtonText: yesButtonText,
          secondaryButtonText: noButtonText,
          onPrimaryButtonClick: () => handleConfirm(true),
          onSecondaryButtonClick: () => handleConfirm(false),
          onClose: () => handleConfirm(false),
        });
      }),
    [addDialog, closeCurrentDialog]
  );

  return (
    <warningContext.Provider
      value={{ modalData, addDialog, closeCurrentDialog, alert, confirm }}
    >
      {children}
    </warningContext.Provider>
  );
};
