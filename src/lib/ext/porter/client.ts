import { Runtime, browser } from "webextension-polyfill-ts";
import { PorterMessageType, PorterClientMessage } from "./types";
import { deserializeError, PorterTimeoutError } from "./helpers";

export class PorterClient<ReqData = any, ResData = unknown> {
  public port: Runtime.Port;
  private reqId = 0;

  constructor(name: string) {
    this.port = browser.runtime.connect({ name } as any);
  }

  get name() {
    return this.port.name;
  }

  /**
   * Makes a request to background process and returns a response promise
   */
  async request(data: ReqData, requestTimeout = 60_000): Promise<ResData> {
    const reqId = this.reqId++;

    this.send({ type: PorterMessageType.Req, reqId, data });

    let timeoutId: any;
    return new Promise((resolve, reject) => {
      const listener = (msg: any) => {
        switch (true) {
          case msg?.reqId !== reqId:
            return;

          case msg?.type === PorterMessageType.Res:
            resolve(msg.data);
            break;

          case msg?.type === PorterMessageType.Err:
            reject(deserializeError(msg.data));
            break;
        }

        clearTimeout(timeoutId);
        this.port.onMessage.removeListener(listener);
      };

      this.port.onMessage.addListener(listener);

      if (requestTimeout !== Infinity) {
        timeoutId = setTimeout(() => {
          this.port.onMessage.removeListener(listener);
          reject(new PorterTimeoutError());
        }, requestTimeout);
      }
    });
  }

  /**
   * Allows to subscribe to notifications channel from background process
   */
  onMessage<OneWayData = unknown>(callback: (data: OneWayData) => void) {
    const listener = (msg: any) => {
      if (msg?.type === PorterMessageType.OneWay) {
        callback(msg.data);
      }
    };

    this.port.onMessage.addListener(listener);
    return () => this.port.onMessage.removeListener(listener);
  }

  onDisconnect(callback: () => void) {
    this.port.onDisconnect.addListener(callback);
    return this.port.onDisconnect.removeListener(callback);
  }

  destroy() {
    this.port.disconnect();
  }

  private send(msg: PorterClientMessage) {
    this.port.postMessage(msg);
  }
}
