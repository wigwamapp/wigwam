import {
  createContext,
  FC,
  ReactNode,
  useCallback,
  useContext,
  useRef,
} from "react";
import useForceUpdate from "use-force-update";
import memoizeOne from "memoize-one";
import { assert } from "lib/system/assert";
import { forEachSafe } from "lib/system/forEachSafe";

import { SecondaryModalProps } from "app/components/elements/SecondaryModal";

type ModalProps = Omit<SecondaryModalProps, "header" | "open" | "onOpenChange">;

type DialogContextDataProps =
  | (ModalProps & {
      header: ReactNode;
      primaryButtonText?: ReactNode;
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
} & ModalProps;

type ConfirmParams = {
  title: ReactNode;
  content: ReactNode;
  yesButtonText?: ReactNode;
  noButtonText?: ReactNode;
} & ModalProps;

type WaitLoadingParams = {
  title: ReactNode;
  content: ReactNode;
  loadingHandler: LoadingHandler;
} & ModalProps;

type DialogContextProps = {
  modalData: DialogContextDataProps;
  addDialog: (params: DialogContextDataProps) => void;
  closeCurrentDialog: () => void;
  alert: (params: AlertParams) => Promise<void>;
  confirm: (params: ConfirmParams) => Promise<boolean>;
  waitLoading: (params: WaitLoadingParams) => Promise<boolean>;
};

export type LoadingHandler = (
  onClose: (callback: () => void) => void,
  params?: any[]
) => Promise<boolean>;

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
    ({ title, content, okButtonText = "OK", ...rest }: AlertParams) =>
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
          ...rest,
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
      ...rest
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
          ...rest,
        });
      }),
    [addDialog, closeCurrentDialog]
  );

  const waitLoading = useCallback(
    ({ title, content, loadingHandler, ...rest }: WaitLoadingParams) =>
      new Promise<boolean>(async (res) => {
        const closeHandlers = new Set<() => void>();

        const handleConfirm = memoizeOne((confirmed: boolean) => {
          forEachSafe(closeHandlers, (handle) => handle());
          closeCurrentDialog();
          res(confirmed);
        });

        addDialog({
          header: title,
          children: content,
          onClose: () => handleConfirm(false),
          disabledClickOutside: true,
          ...rest,
        });

        try {
          const res = await loadingHandler((handler) => {
            closeHandlers.add(handler);
          });
          handleConfirm(res);
        } catch (err: any) {
          const msg = err?.message ?? "Unknown error";
          handleConfirm(false);
          alert({
            title: "Error!",
            content: msg,
          });
        }
      }),
    [addDialog, alert, closeCurrentDialog]
  );

  return (
    <dialogContext.Provider
      value={{
        modalData,
        addDialog,
        closeCurrentDialog,
        alert,
        confirm,
        waitLoading,
      }}
    >
      {children}
    </dialogContext.Provider>
  );
};
