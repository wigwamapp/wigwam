import { Runtime, browser } from "webextension-polyfill-ts";
import { IntercomMessageType, IntercomClientMessage } from "./types";
import { deserializeError, IntercomTimeoutError } from "./helpers";

export class IntercomClient<ReqData = any, ResData = unknown> {
  public port: Runtime.Port;
  private reqId = 0;

  constructor(name: string) {
    this.port = browser.runtime.connect(undefined, { name });
  }

  get name() {
    return this.port.name;
  }

  /**
   * Makes a request to background process and returns a response promise
   */
  async request(data: ReqData, requestTimeout = 60_000): Promise<ResData> {
    const reqId = this.reqId++;

    this.send({ type: IntercomMessageType.Req, reqId, data });

    return new Promise((resolve, reject) => {
      const listener = (msg: any) => {
        switch (true) {
          case msg?.reqId !== reqId:
            return;

          case msg?.type === IntercomMessageType.Res:
            resolve(msg.data);
            break;

          case msg?.type === IntercomMessageType.Err:
            reject(deserializeError(msg.data));
            break;
        }

        clearTimeout(timeoutId);
        this.port.onMessage.removeListener(listener);
      };

      this.port.onMessage.addListener(listener);

      const timeoutId = setTimeout(() => {
        this.port.onMessage.removeListener(listener);
        reject(new IntercomTimeoutError());
      }, requestTimeout);
    });
  }

  /**
   * Allows to subscribe to notifications channel from background process
   */
  onMessage<OneWayData = unknown>(callback: (data: OneWayData) => void) {
    const listener = (msg: any) => {
      if (msg?.type === IntercomMessageType.OneWay) {
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

  private send(msg: IntercomClientMessage) {
    this.port.postMessage(msg);
  }
}
