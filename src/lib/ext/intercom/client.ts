import { Runtime, browser } from "webextension-polyfill-ts";
import { IntercomMessageType, IntercomClientMessage } from "./types";
import { deserializeError, IntercomTimeoutError } from "./helpers";

export class IntercomClient<ReqData = any, ResData = any> {
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

        this.port.onMessage.removeListener(listener);
      };

      this.port.onMessage.addListener(listener);

      setTimeout(() => {
        this.port.onMessage.removeListener(listener);
        reject(new IntercomTimeoutError());
      }, requestTimeout);
    });
  }

  /**
   * Allows to subscribe to notifications channel from background process
   */
  onMessage<T = any>(callback: (data: T) => void) {
    const listener = (msg: any) => {
      if (msg?.type === IntercomMessageType.Void) {
        callback(msg.data);
      }
    };

    this.port.onMessage.addListener(listener);
    return () => this.port.onMessage.removeListener(listener);
  }

  destroy() {
    this.port.disconnect();
  }

  private send(msg: IntercomClientMessage) {
    this.port.postMessage(msg);
  }
}
