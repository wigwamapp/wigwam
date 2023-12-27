import { FC, useEffect } from "react";
import events from "events";
import { generateURL, makeHandleMessage } from "../../utils/transak";
import { TransakConfig, Events } from "../../../core/types/transak";
import Pusher from "pusher-js";

const Transak: FC<{ config: TransakConfig }> = ({ config }) => {
  const url = generateURL(config);

  const close = () => {
    eventEmitter.removeAllListeners();
    window.removeEventListener("message", handleMessage);
  };

  const eventEmitter = new events.EventEmitter();

  const handleMessage = makeHandleMessage(eventEmitter, close);

  const initWsConnection = (orderId: string) => {
    Pusher.logToConsole = true;
    const pusher = new Pusher("1d9ffac87de599c61283", { cluster: "ap2" });
    const channel = pusher.subscribe(orderId);
    // https://docs.transak.com/docs/websocket-integrations

    console.log(orderId);

    //receive updates of a specific event
    channel.bind(`ORDER_COMPLETED`, (orderData: any) => {
      console.log("ORDER_COMPLETED", orderData);
    });

    pusher.bind_global((eventId: any, orderData: any) => {
      console.log(`pusher ${eventId} ${orderData}`);
    });
  };

  useEffect(() => {
    open();

    return () => close();
  }, [url, close]);

  const open = () => {
    window.addEventListener("message", handleMessage);
    // initWsConnection('814e51d8-6ac6-4f24-b66a-0b8b4a465b72')
  };

  eventEmitter.on(Events.TRANSAK_WIDGET_INITIALISED, (payload) => {
    console.log(payload);
  });

  eventEmitter.on(Events.TRANSAK_ORDER_CREATED, (payload) => {
    initWsConnection(payload.status.id);
    console.log(payload);
  });

  eventEmitter.on(Events.TRANSAK_ORDER_SUCCESSFUL, (payload) => {
    console.log(payload);
  });

  eventEmitter.on(Events.TRANSAK_ORDER_CANCELLED, (payload) => {
    console.log(payload);
  });

  eventEmitter.on(Events.TRANSAK_ORDER_FAILED, (payload) => {
    console.log(payload);
  });

  eventEmitter.on(Events.TRANSAK_WALLET_REDIRECTION, (payload) => {
    console.log(payload);
  });

  return (
    <div className="w-full" id="transakPanel">
      <iframe
        id="transakIframe"
        title="transak"
        src={url}
        allow="camera;microphone;payment"
        style={{ height: "100%", width: "100%", border: "none" }}
      ></iframe>
    </div>
  );
};

export default Transak;
