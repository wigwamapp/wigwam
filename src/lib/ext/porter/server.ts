import browser, { Runtime } from "webextension-polyfill";
import { forEachSafe } from "lib/system/forEachSafe";

import {
  PorterMessageType,
  PorterClientMessage,
  PorterServerMessage,
  PorterOneWay,
} from "./types";
import {
  MESSAGE_TYPES,
  serializeError,
  sanitizeMessage,
  getPortId,
} from "./helpers";

export type PorterMessageHandler<Data = any, ReplyData = any> = (
  ctx: MessageContext<Data, ReplyData>,
) => void;

export type PorterConnectionHandler = (
  action: "connect" | "disconnect",
  port: Runtime.Port,
) => void;

// Required to recreate MessageContext
// This is necessary to send an RPC response for those requests
// that were recovered after the Service Worker's restart
// (as it has the capability to sleep)
const ALL_PORTS = new Map<string, Runtime.Port>();

export class PorterServer<OneWayData = any> {
  private ports = new Map<string, Runtime.Port>();
  private messageHandlers = new Set<PorterMessageHandler>();
  private connectionHandlers = new Set<PorterConnectionHandler>();

  get portsCount() {
    return this.ports.size;
  }

  constructor(public name: string) {
    browser.runtime.onConnect.addListener(this.handleConnect.bind(this));
    this.handleMessage = this.handleMessage.bind(this);
  }

  onMessage<Data = unknown, ReplyData = any>(
    handler: PorterMessageHandler<Data, ReplyData>,
  ) {
    this.addMessageHandler(handler);
    return () => this.removeMessageHandler(handler);
  }

  onConnection(handler: PorterConnectionHandler) {
    this.connectionHandlers.add(handler);
    return () => this.connectionHandlers.delete(handler);
  }

  isConnected(port: Runtime.Port) {
    return this.ports.has(getPortId(port));
  }

  broadcast(data: OneWayData) {
    const msg: PorterOneWay = { type: PorterMessageType.OneWay, data };
    for (const port of this.ports.values()) {
      port.postMessage(sanitizeMessage(msg));
    }
  }

  notify(port: Runtime.Port, data: OneWayData) {
    if (this.isConnected(port)) {
      port.postMessage(
        sanitizeMessage({ type: PorterMessageType.OneWay, data }),
      );
    }
  }

  private handleConnect(port: Runtime.Port) {
    ALL_PORTS.set(getPortId(port), port);

    if (port.name.startsWith(this.name)) {
      this.addPort(port);

      forEachSafe(this.connectionHandlers, (handle) => handle("connect", port));

      port.onDisconnect.addListener(() => {
        ALL_PORTS.delete(getPortId(port));

        this.removePort(port);

        forEachSafe(this.connectionHandlers, (handle) =>
          handle("disconnect", port),
        );
      });
    }
  }

  private handleMessage(msg: any, port: Runtime.Port) {
    if (
      port.sender?.id === browser.runtime.id &&
      MESSAGE_TYPES.includes(msg?.type)
    ) {
      const ctx = new MessageContext(
        getPortId(port),
        msg as PorterClientMessage,
      );

      forEachSafe(this.messageHandlers, (handle) => handle(ctx));
    }
  }

  private addPort(port: Runtime.Port) {
    port.onMessage.addListener(this.handleMessage);
    this.ports.set(getPortId(port), port);
  }

  private removePort(port: Runtime.Port) {
    port.onMessage.removeListener(this.handleMessage);
    this.ports.delete(getPortId(port));
  }

  private addMessageHandler(handler: PorterMessageHandler) {
    this.messageHandlers.add(handler);
  }

  private removeMessageHandler(handler: PorterMessageHandler) {
    this.messageHandlers.delete(handler);
  }
}

export class MessageContext<Data, ReplyData> {
  constructor(
    public portId: string,
    public msg: PorterClientMessage,
  ) {}

  get port() {
    return ALL_PORTS.get(this.portId);
  }

  get request() {
    return this.msg.type === PorterMessageType.Req;
  }

  get data(): Data {
    return this.msg.data;
  }

  reply(data: ReplyData) {
    this.send(
      this.msg.type === PorterMessageType.Req
        ? {
            type: PorterMessageType.Res,
            reqId: this.msg.reqId,
            data,
          }
        : {
            type: PorterMessageType.OneWay,
            data,
          },
    );
  }

  replyError(err: any) {
    if (this.msg.type !== PorterMessageType.Req) {
      console.warn("Not allowed for non-request messages");
      console.error(err);
      return;
    }

    this.send({
      type: PorterMessageType.Err,
      reqId: this.msg.reqId,
      data: serializeError(err),
    });
  }

  private send(res: PorterServerMessage) {
    this.port?.postMessage(sanitizeMessage(res));
  }
}
