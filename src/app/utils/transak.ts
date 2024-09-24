import pako from "pako";
import {
  type TransakConfig,
  Environments,
  TransakEvents,
} from "core/types/ramp";
import { Emitter } from "lib/emitter";

export const WebAppUrls = {
  [Environments.STAGING]: "https://global-stg.transak.com",
  [Environments.PRODUCTION]: "https://global.transak.com",
};

export function generateURL(configData: TransakConfig) {
  const { environment = Environments.STAGING } = configData;
  const queryParams = {};
  let queryString = "";

  (Object.keys(configData) as (keyof TransakConfig)[]).forEach((key) => {
    if (["environment", "widgetWidth", "widgetHeight"].includes(key)) return;

    if (["walletAddressesData", "userData"].includes(key)) {
      try {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        queryParams[key] = JSON.stringify(configData[key]);
      } catch {}

      return;
    }

    if (["nftData", "sourceTokenData", "cryptoCurrencyData"].includes(key)) {
      try {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        queryParams[key] = btoa(JSON.stringify(configData[key]));
      } catch {}

      return;
    }

    if (["calldata"].includes(key)) {
      try {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        queryParams[key] = btoa(
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          String.fromCharCode.apply(null, pako.deflate(configData[key])),
        );
      } catch {}

      return;
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    queryParams[key] = configData[key];
  });

  queryString = new URLSearchParams(queryParams).toString();

  return `${WebAppUrls[environment]}?${queryString}`;
}

export function makeHandleMessage(eventEmitter: Emitter, close: () => void) {
  return function handleMessage(
    event: MessageEvent<{ event_id: TransakEvents; data: unknown }>,
  ) {
    if (event?.data?.event_id) {
      // eslint-disable-next-line default-case
      switch (event.data.event_id) {
        case TransakEvents.TRANSAK_WIDGET_INITIALISED: {
          eventEmitter.emit(TransakEvents.TRANSAK_WIDGET_INITIALISED, {
            eventName: TransakEvents.TRANSAK_WIDGET_INITIALISED,
            status: true,
          });

          break;
        }

        case TransakEvents.TRANSAK_ORDER_CREATED: {
          eventEmitter.emit(TransakEvents.TRANSAK_ORDER_CREATED, {
            eventName: TransakEvents.TRANSAK_ORDER_CREATED,
            status: event.data.data,
          });

          break;
        }

        case TransakEvents.TRANSAK_ORDER_SUCCESSFUL: {
          eventEmitter.emit(TransakEvents.TRANSAK_ORDER_SUCCESSFUL, {
            eventName: TransakEvents.TRANSAK_ORDER_SUCCESSFUL,
            status: event.data.data,
          });

          break;
        }

        case TransakEvents.TRANSAK_ORDER_CANCELLED: {
          eventEmitter.emit(TransakEvents.TRANSAK_ORDER_CANCELLED, {
            eventName: TransakEvents.TRANSAK_ORDER_CANCELLED,
            status: event.data.data,
          });

          break;
        }

        case TransakEvents.TRANSAK_ORDER_FAILED: {
          eventEmitter.emit(TransakEvents.TRANSAK_ORDER_FAILED, {
            eventName: TransakEvents.TRANSAK_ORDER_FAILED,
            status: event.data.data,
          });

          break;
        }

        case TransakEvents.TRANSAK_WALLET_REDIRECTION: {
          eventEmitter.emit(TransakEvents.TRANSAK_WALLET_REDIRECTION, {
            eventName: TransakEvents.TRANSAK_WALLET_REDIRECTION,
            status: event.data.data,
          });

          break;
        }

        case TransakEvents.TRANSAK_WIDGET_CLOSE: {
          eventEmitter.emit(TransakEvents.TRANSAK_WIDGET_CLOSE, {
            eventName: TransakEvents.TRANSAK_WIDGET_CLOSE,
            status: true,
          });

          close();

          break;
        }
      }
    }
  };
}
