import qs from "query-string";
import pako from "pako";
import { Environments, TransakConfig, Events } from "../../core/types/transak";
import { EventEmitter } from "events";

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
      } catch (e) {
        /* empty */
      }

      return;
    }

    if (["nftData", "sourceTokenData", "cryptoCurrencyData"].includes(key)) {
      try {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        queryParams[key] = btoa(JSON.stringify(configData[key]));
      } catch (e) {
        /* empty */
      }

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
      } catch (e) {
        /* empty */
      }

      return;
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    queryParams[key] = configData[key];
  });

  queryString = qs.stringify(queryParams, { arrayFormat: "comma" });

  return `${WebAppUrls[environment]}?${queryString}`;
}

export function makeHandleMessage(
  eventEmitter: EventEmitter,
  close: () => void,
) {
  return function handleMessage(
    event: MessageEvent<{ event_id: Events; data: unknown }>,
  ) {
    if (event?.data?.event_id) {
      // eslint-disable-next-line default-case
      switch (event.data.event_id) {
        case Events.TRANSAK_WIDGET_INITIALISED: {
          eventEmitter.emit(Events.TRANSAK_WIDGET_INITIALISED, {
            eventName: Events.TRANSAK_WIDGET_INITIALISED,
            status: true,
          });

          break;
        }

        case Events.TRANSAK_ORDER_CREATED: {
          eventEmitter.emit(Events.TRANSAK_ORDER_CREATED, {
            eventName: Events.TRANSAK_ORDER_CREATED,
            status: event.data.data,
          });

          break;
        }

        case Events.TRANSAK_ORDER_SUCCESSFUL: {
          eventEmitter.emit(Events.TRANSAK_ORDER_SUCCESSFUL, {
            eventName: Events.TRANSAK_ORDER_SUCCESSFUL,
            status: event.data.data,
          });

          break;
        }

        case Events.TRANSAK_ORDER_CANCELLED: {
          eventEmitter.emit(Events.TRANSAK_ORDER_CANCELLED, {
            eventName: Events.TRANSAK_ORDER_CANCELLED,
            status: event.data.data,
          });

          break;
        }

        case Events.TRANSAK_ORDER_FAILED: {
          eventEmitter.emit(Events.TRANSAK_ORDER_FAILED, {
            eventName: Events.TRANSAK_ORDER_FAILED,
            status: event.data.data,
          });

          break;
        }

        case Events.TRANSAK_WALLET_REDIRECTION: {
          eventEmitter.emit(Events.TRANSAK_WALLET_REDIRECTION, {
            eventName: Events.TRANSAK_WALLET_REDIRECTION,
            status: event.data.data,
          });

          break;
        }

        case Events.TRANSAK_WIDGET_CLOSE: {
          eventEmitter.emit(Events.TRANSAK_WIDGET_CLOSE, {
            eventName: Events.TRANSAK_WIDGET_CLOSE,
            status: true,
          });

          close();

          break;
        }
      }
    }
  };
}
