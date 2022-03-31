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

type DialogContextDataProps =
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

type DialogContextProps = {
  modalData: DialogContextDataProps;
  addDialog: (params: DialogContextDataProps) => void;
  closeCurrentDialog: () => void;
  alert: (params: AlertParams) => Promise<void>;
  confirm: (params: ConfirmParams) => Promise<boolean>;
};

const OPEN_NEXT_DELAY = 300;

export const dialogContext = createContext<DialogContextProps | null>(null);

export const useDialog = () => {
  const value = useContext(dialogContext);
  assert(value);

  return value;
};

export const DialogProvider: FC = ({ children }) => {
  const forceUpdate = useForceUpdate();

  const queueRef = useRef<DialogContextDataProps[]>([]);
  const openedRef = useRef(false);

  const addDialog = useCallback(
    (params: DialogContextDataProps) => {
      queueRef.current.push(params);

      if (queueRef.current.length === 1) {
        openedRef.current = true;
      }

      forceUpdate();
    },
    [forceUpdate]
  );

  const closeCurrentDialog = useCallback(() => {
    if (!openedRef.current) return;

    queueRef.current.shift();
    openedRef.current = false;

    if (queueRef.current.length > 0) {
      setTimeout(() => {
        openedRef.current = true;
        forceUpdate();
      }, OPEN_NEXT_DELAY);
    }

    forceUpdate();
  }, [forceUpdate]);

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
    <dialogContext.Provider
      value={{ modalData, addDialog, closeCurrentDialog, alert, confirm }}
    >
      {children}
    </dialogContext.Provider>
  );
};
