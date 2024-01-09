import { type FC, useEffect, useCallback, useMemo } from "react";
import events from "events";
import { useAtom } from "jotai";
import { type TransakConfig, TransakEvents } from "core/types/transak";
import { generateURL, makeHandleMessage } from "app/utils/transak";
import { onRampModalAtom } from "app/atoms";
import { useDialog } from "app/hooks/dialog";
import { ReactComponent as ProcessingIcon } from "app/icons/onramp-tx-pending.svg";

const OnRampIframe: FC<{ config: TransakConfig }> = ({ config }) => {
  const { alert } = useDialog();
  const [, setOnRampModalOpened] = useAtom(onRampModalAtom);
  const iframeUrl = useMemo(() => generateURL(config), [config]);
  const eventEmitter = useMemo(() => new events.EventEmitter(), []);

  const handleSuccessOrder = useCallback(() => {
    setOnRampModalOpened([false, "replace"]);
    alert({
      title: (
        <div className="flex items-center gap-2">
          <ProcessingIcon className="w-8" /> Transaction Processing
        </div>
      ),
      content: (
        <p>
          Great news! We&apos;re processing your credit card transaction for
          cryptocurrency. It won&apos;t be long now.
        </p>
      ),
    });
  }, [alert, setOnRampModalOpened]);

  const handleCloseIframe = useCallback(() => {
    eventEmitter.removeAllListeners();
    window.removeEventListener(
      "message",
      makeHandleMessage(eventEmitter, handleCloseIframe),
    );
    eventEmitter.off(
      TransakEvents.TRANSAK_ORDER_SUCCESSFUL,
      handleSuccessOrder,
    );
  }, [eventEmitter, handleSuccessOrder]);

  const handleOpenIframe = useCallback(() => {
    window.addEventListener(
      "message",
      makeHandleMessage(eventEmitter, handleCloseIframe),
    );

    eventEmitter.on(TransakEvents.TRANSAK_ORDER_SUCCESSFUL, handleSuccessOrder);
  }, [eventEmitter, handleCloseIframe, handleSuccessOrder]);

  useEffect(() => {
    handleOpenIframe();

    return () => handleCloseIframe();
  }, [handleCloseIframe, handleOpenIframe, iframeUrl]);

  return (
    <div
      className="h-full pt-10 pb-5 flex justify-center rounded-[2rem]"
      id="transakPanel"
    >
      <iframe
        id="transakIframe"
        title="transak"
        src={iframeUrl}
        allow="camera;microphone;payment"
        className="rounded-3xl h-full pt-2 mt-2 w-[26rem] border-none"
      />
    </div>
  );
};

export default OnRampIframe;
