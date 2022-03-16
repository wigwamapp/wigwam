import browser, { Runtime } from "webextension-polyfill";
import { forEachSafe } from "lib/system/forEachSafe";

import { PorterMessageType } from "./types";
import {
  deserializeError,
  PorterTimeoutError,
  PorterDisconnectedError,
} from "./helpers";

export class PorterClient<ReqData = any, ResData = unknown> {
  private port?: Runtime.Port;
  private reqId = 0;
  private messageHandlers = new Set<(msg: any) => void>();

  private connectedAt?: number;

  connect(name: string) {
    this.port?.disconnect();

    const port = browser.runtime.connect({ name });

    port.onMessage.addListener((msg) => {
      forEachSafe(this.messageHandlers, (handle) => handle(msg));
    });

    port.onDisconnect.addListener((p) => {
      delete this.port;

      if (Date.now() - this.connectedAt! > 1_000) {
        this.connect(name);
      } else {
        setTimeout(() => this.connect(name), 1_000);
      }

      const err = p.error ?? browser.runtime.lastError;
      if (err) console.error(new Error(err.message));
    });

    this.port = port;
    this.connectedAt = Date.now();
  }

  /**
   * Makes a request to background process and returns a response promise
   */
  async request(
    data: ReqData,
    opts: { timeout?: number; signal?: AbortSignal } = {}
  ): Promise<ResData> {
    const port = this.getCurrentPort();
    const reqId = this.reqId++;

    port.postMessage({ type: PorterMessageType.Req, reqId, data });

    return new Promise((resolve, reject) => {
      const handleMessage = (msg: any) => {
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

        cleanup();
      };

      const handleDisconnect = () => {
        cleanup();
        reject(new PorterDisconnectedError());
      };

      const handleAbort = () => {
        cleanup();
        reject(new Error("Request cancelled"));
      };

      const handleTimeout = () => {
        cleanup();
        reject(new PorterTimeoutError());
      };

      let timeoutId: ReturnType<typeof setTimeout>;

      const cleanup = () => {
        clearTimeout(timeoutId);
        opts.signal?.removeEventListener("abort", handleAbort);
        port.onDisconnect.removeListener(handleDisconnect);
        this.messageHandlers.delete(handleMessage);
      };

      this.messageHandlers.add(handleMessage);
      port.onDisconnect.addListener(handleDisconnect);
      opts.signal?.addEventListener("abort", handleAbort);
      if (opts.timeout !== 0) {
        timeoutId = setTimeout(handleTimeout, opts.timeout ?? 60_000);
      }
    });
  }

  sendOneWayMessage<T>(data: T) {
    const port = this.getCurrentPort();
    port.postMessage({ type: PorterMessageType.OneWay, data });
  }

  /**
   * Allows to subscribe to notifications channel from background process
   */
  onOneWayMessage<OneWayData = unknown>(callback: (data: OneWayData) => void) {
    const listener = (msg: any) => {
      if (msg?.type === PorterMessageType.OneWay) {
        callback(msg.data);
      }
    };

    this.messageHandlers.add(listener);
    return () => this.messageHandlers.delete(listener);
  }

  private getCurrentPort() {
    if (this.port) return this.port;

    throw new PorterDisconnectedError();
  }
}
