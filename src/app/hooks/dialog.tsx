import {
  createContext,
  FC,
  Dispatch,
  ReactNode,
  useCallback,
  useContext,
  useRef,
  PropsWithChildren,
} from "react";
import useForceUpdate from "use-force-update";
import memoizeOne from "memoize-one";
import { assert } from "lib/system/assert";
import { forEachSafe } from "lib/system/forEachSafe";

import { SecondaryModalProps } from "app/components/elements/SecondaryModal";
import type { ButtonTheme } from "app/components/elements/Button";

type ModalProps = Omit<SecondaryModalProps, "header" | "open" | "onOpenChange">;

type DialogContextDataProps =
  | (ModalProps & {
      children: ReactNode | ((state: any) => ReactNode);
      header: ReactNode;
      primaryButtonText?: ReactNode;
      onPrimaryButtonClick?: () => void;
      secondaryButtonText?: ReactNode;
      onSecondaryButtonClick?: () => void;
      onClose?: () => void;
      state?: any;
      buttonTheme?: Partial<{
        primary: ButtonTheme;
        secondary: ButtonTheme;
      }>;
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
  buttonTheme?: Partial<{
    primary: ButtonTheme;
    secondary: ButtonTheme;
  }>;
} & ModalProps;

type WaitLoadingParams<P = any, S = any> = {
  title: ReactNode;
  content: ReactNode | ((state: S) => ReactNode);
  loadingHandler: LoadingHandler;
  handlerParams?: P;
  state?: S;
} & ModalProps;

type DialogContextProps = {
  modalData: DialogContextDataProps;
  addDialog: (params: DialogContextDataProps) => void;
  closeCurrentDialog: () => void;
  alert: (params: AlertParams) => Promise<void>;
  confirm: (params: ConfirmParams) => Promise<boolean>;
  waitLoading: (params: WaitLoadingParams) => Promise<boolean>;
};

export type LoadingHandler<P = any, S = any> = (opts: {
  params: P;
  setState: Dispatch<S>;
  onClose: (callback: () => void) => void;
}) => Promise<boolean>;

const OPEN_NEXT_DELAY = 300;

export const dialogContext = createContext<DialogContextProps | null>(null);

export const useDialog = () => {
  const value = useContext(dialogContext);
  assert(value);

  return value;
};

export const DialogProvider: FC<PropsWithChildren> = ({ children }) => {
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
    [forceUpdate],
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

  let modalData = openedRef.current ? queueRef.current[0] : null;

  if (typeof modalData?.children === "function") {
    modalData = {
      ...modalData,
      children: modalData.children(modalData.state),
    };
  }

  const alert = useCallback(
    ({ title, content, okButtonText = "OK", ...rest }: AlertParams) =>
      new Promise<void>((res) => {
        const handleDone = memoizeOne(() => {
          closeCurrentDialog();
          res();
        });

        addDialog({
          header: title,
          children: content,
          primaryButtonText: okButtonText,
          onPrimaryButtonClick: handleDone,
          onClose: handleDone,
          ...rest,
        });
      }),
    [addDialog, closeCurrentDialog],
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
        const handleConfirm = memoizeOne((confirmed: boolean) => {
          closeCurrentDialog();
          res(confirmed);
        });

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
    [addDialog, closeCurrentDialog],
  );

  const waitLoading = useCallback(
    ({
      title,
      content,
      loadingHandler,
      handlerParams,
      ...rest
    }: WaitLoadingParams) =>
      new Promise<boolean>(async (res) => {
        const closeHandlers = new Set<() => void>();

        const handleConfirm = memoizeOne((confirmed: boolean) => {
          forEachSafe(closeHandlers, (handle) => handle());
          closeCurrentDialog();
          res(confirmed);
        });

        const dialogParams: DialogContextDataProps = {
          header: title,
          children: content as any,
          onClose: () => handleConfirm(false),
          disabledClickOutside: true,
          ...rest,
        };

        addDialog(dialogParams);

        try {
          const res = await loadingHandler({
            params: handlerParams,
            setState: (val) => {
              dialogParams.state =
                typeof val === "function" ? val(dialogParams.state) : val;

              forceUpdate();
            },
            onClose: (handler) => {
              closeHandlers.add(handler);
            },
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
    [forceUpdate, addDialog, alert, closeCurrentDialog],
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
