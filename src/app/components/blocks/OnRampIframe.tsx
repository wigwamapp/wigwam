import { type FC, useEffect } from "react";
import events from "events";
import Pusher from "pusher-js";
import { useAtom } from "jotai";
import {
  type TransakConfig,
  TransakEvents,
  PusherEvents,
} from "core/types/transak";
import { generateURL, makeHandleMessage } from "app/utils/transak";
import { onRampModalAtom } from "app/atoms";
import { useDialog } from "app/hooks/dialog";
import { ReactComponent as ProcessingIcon } from "app/icons/onramp-tx-pending.svg";

const OnRampIframe: FC<{ config: TransakConfig }> = ({ config }) => {
  const eventEmitter = new events.EventEmitter();
  const url = generateURL(config);
  const [, setOnRampModalOpened] = useAtom(onRampModalAtom);
  const { alert } = useDialog();

  const close = () => {
    eventEmitter.removeAllListeners();
    window.removeEventListener("message", handleMessage);
  };

  const handleMessage = makeHandleMessage(eventEmitter, close);

  const initWsConnection = (orderId: string) => {
    // https://docs.transak.com/docs/websocket-integrations
    // * receive updates of a specific event

    Pusher.logToConsole = true;
    const pusher = new Pusher(process.env.WIGWAM_PUSHER_APP_KEY!, {
      cluster: process.env.WIGWAM_PUSHER_CLUSTER!,
    });
    const channel = pusher.subscribe(orderId);

    channel.bind(PusherEvents.ORDER_PROCESSING, () => {
      setOnRampModalOpened([false]);
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
    });
  };

  useEffect(() => {
    open();

    return () => close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, close]);

  const open = () => {
    window.addEventListener("message", handleMessage);
  };

  eventEmitter.on(TransakEvents.TRANSAK_ORDER_CREATED, (payload) => {
    initWsConnection(payload.status.id);
  });

  return (
    <div
      className="h-full pt-10 pb-5 flex justify-center rounded-[2rem]"
      id="transakPanel"
    >
      <iframe
        id="transakIframe"
        title="transak"
        src={url}
        allow="camera;microphone;payment"
        className="rounded-3xl h-full pt-2 mt-2 w-[26rem] border-none"
      />
    </div>
  );
};

export default OnRampIframe;
