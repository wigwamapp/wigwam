export const INPAGE_PROTOCOL = "VIGVAM_INPAGE_0";

export type InpageMessageTarget = "injected" | "content";
export type InpageMessage<T = any> = {
  protocol: typeof INPAGE_PROTOCOL;
  target: InpageMessageTarget;
  data: T;
};

export class InpageProtocol {
  constructor(
    public self: InpageMessageTarget,
    public recipient: InpageMessageTarget
  ) {}

  send(data: any) {
    const msg: InpageMessage = {
      protocol: INPAGE_PROTOCOL,
      target: this.recipient,
      data,
    };

    window.postMessage(msg, location.origin);
  }

  subscribe<T = any>(
    callback: (payload: T, evt: MessageEvent<InpageMessage<T>>) => void
  ) {
    const handleMessage = (evt: MessageEvent<InpageMessage<T>>) => {
      if (
        evt.source === window &&
        evt.origin === location.origin &&
        evt.data?.protocol === INPAGE_PROTOCOL &&
        evt.data.target === this.self
      ) {
        callback(evt.data.data, evt);
      }
    };

    window.addEventListener("message", handleMessage, false);
    return () => window.removeEventListener("message", handleMessage, false);
  }
}
