export type InpageMessageTarget = "injected" | "content";
export type InpageMessage<T = any> = {
  bid: string; // Build ID
  target: InpageMessageTarget;
  data: T;
};

const BUILD_ID = process.env.BUILD_ID;

export class InpageProtocol {
  constructor(
    public self: InpageMessageTarget,
    public recipient: InpageMessageTarget,
  ) {}

  send(data: any) {
    const msg: InpageMessage = {
      bid: BUILD_ID,
      target: this.recipient,
      data,
    };

    window.postMessage(msg, location.origin);
  }

  subscribe<T = any>(
    callback: (payload: T, evt: MessageEvent<InpageMessage<T>>) => void,
  ) {
    const handleMessage = (evt: MessageEvent<InpageMessage<T>>) => {
      if (
        evt.source === window &&
        evt.origin === location.origin &&
        evt.data?.bid === BUILD_ID &&
        evt.data.target === this.self
      ) {
        callback(evt.data.data, evt);
      }
    };

    window.addEventListener("message", handleMessage, false);
    return () => window.removeEventListener("message", handleMessage, false);
  }
}
