import browser, { Runtime } from "webextension-polyfill";
import { assert } from "lib/system/assert";
import { forEachSafe } from "lib/system/forEachSafe";

import {
  PorterMessageType,
  PorterClientMessage,
  PorterRequest,
  PorterResponse,
  PorterErrorResponse,
  PorterOneWay,
} from "./types";
import { MESSAGE_TYPES, serializeError } from "./helpers";

export type PorterMessageHandler<Data = any, ReplyData = any> = (
  ctx: MessageContext<Data, ReplyData>
) => void;

export type PorterConnectionHandler = (
  action: "connect" | "disconnect",
  port: Runtime.Port
) => void;

export class PorterServer<OneWayData = any> {
  private ports = new Set<Runtime.Port>();
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
    handler: PorterMessageHandler<Data, ReplyData>
  ) {
    this.addMessageHandler(handler);
    return () => this.removeMessageHandler(handler);
  }

  onConnection(handler: PorterConnectionHandler) {
    this.connectionHandlers.add(handler);
    return () => this.connectionHandlers.delete(handler);
  }

  isConnected(port: Runtime.Port) {
    return this.ports.has(port);
  }

  broadcast(data: OneWayData) {
    const msg: PorterOneWay = { type: PorterMessageType.OneWay, data };
    for (const port of this.ports) {
      port.postMessage(msg);
    }
  }

  notify(port: Runtime.Port, data: OneWayData) {
    if (this.isConnected(port)) {
      port.postMessage({ type: PorterMessageType.OneWay, data });
    }
  }

  private handleConnect(port: Runtime.Port) {
    if (port.name === this.name) {
      this.addPort(port);

      forEachSafe(this.connectionHandlers, (handle) => handle("connect", port));

      port.onDisconnect.addListener(() => {
        this.removePort(port);

        forEachSafe(this.connectionHandlers, (handle) =>
          handle("disconnect", port)
        );
      });
    }
  }

  private handleMessage(msg: any, port: Runtime.Port) {
    if (
      port.sender?.id === browser.runtime.id &&
      [0, undefined].includes(port.sender?.frameId) &&
      MESSAGE_TYPES.includes(msg?.type)
    ) {
      const ctx = new MessageContext(port, msg as PorterClientMessage, this);

      forEachSafe(this.messageHandlers, (handle) => handle(ctx));
    }
  }

  private addPort(port: Runtime.Port) {
    port.onMessage.addListener(this.handleMessage);
    this.ports.add(port);
  }

  private removePort(port: Runtime.Port) {
    port.onMessage.removeListener(this.handleMessage);
    this.ports.delete(port);
  }

  private addMessageHandler(handler: PorterMessageHandler) {
    this.messageHandlers.add(handler);
  }

  private removeMessageHandler(handler: PorterMessageHandler) {
    this.messageHandlers.delete(handler);
  }
}

export class MessageContext<Data, ReplyData> {
  public data: Data;

  constructor(
    public port: Runtime.Port,
    private msg: PorterClientMessage,
    private server: PorterServer
  ) {
    this.data = msg.data;
  }

  get connected() {
    return this.server.isConnected(this.port);
  }

  get request() {
    return this.msg.type === PorterMessageType.Req;
  }

  reply(data: ReplyData) {
    assertRequest(this.msg);
    this.send({
      type: PorterMessageType.Res,
      reqId: this.msg.reqId,
      data,
    });
  }

  replyError(err: any) {
    assertRequest(this.msg);
    this.send({
      type: PorterMessageType.Err,
      reqId: this.msg.reqId,
      data: serializeError(err),
    });
  }

  private send(res: PorterResponse | PorterErrorResponse) {
    if (this.connected) {
      this.port.postMessage(res);
    }
  }
}

function assertRequest(msg: PorterClientMessage): asserts msg is PorterRequest {
  assert(
    msg.type === PorterMessageType.Req,
    "Not allowed for non-request messages"
  );
}
