import { browser, Runtime } from "webextension-polyfill-ts";
import { assert } from "lib/system/assert";
import {
  IntercomMessageType,
  IntercomClientMessage,
  IntercomRequest,
  IntercomResponse,
  IntercomErrorResponse,
  IntercomOneWay,
} from "./types";
import { MESSAGE_TYPES, serializeError } from "./helpers";

export type IntercomServerHandler<Data = any, ReplyData = any> = (
  ctx: MessageContext<Data, ReplyData>
) => void;

export class IntercomServer<OneWayData = any> {
  private ports = new Set<Runtime.Port>();
  private msgHandlers = new Set<IntercomServerHandler>();

  constructor(public name: string) {
    browser.runtime.onConnect.addListener((port) => {
      if (port.name === name) {
        this.addPort(port);

        port.onDisconnect.addListener(() => {
          this.removePort(port);
        });
      }
    });

    this.handleMessage = this.handleMessage.bind(this);
  }

  onMessage<Data = unknown, ReplyData = any>(
    handler: IntercomServerHandler<Data, ReplyData>
  ) {
    this.addMessageHandler(handler);
    return () => this.removeMessageHandler(handler);
  }

  isConnected(port: Runtime.Port) {
    return this.ports.has(port);
  }

  broadcast(data: OneWayData) {
    const msg: IntercomOneWay = { type: IntercomMessageType.OneWay, data };
    this.ports.forEach((port) => {
      port.postMessage(msg);
    });
  }

  notify(port: Runtime.Port, data: OneWayData) {
    if (this.isConnected(port)) {
      port.postMessage({ type: IntercomMessageType.OneWay, data });
    }
  }

  private handleMessage(msg: any, port: Runtime.Port) {
    if (
      port.sender?.id === browser.runtime.id &&
      port.sender?.frameId === 0 &&
      MESSAGE_TYPES.includes(msg?.type)
    ) {
      const ctx = new MessageContext(port, msg as IntercomClientMessage, this);

      for (const handler of this.msgHandlers) {
        try {
          handler(ctx);
        } catch {}
      }
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

  private addMessageHandler(handler: IntercomServerHandler) {
    this.msgHandlers.add(handler);
  }

  private removeMessageHandler(handler: IntercomServerHandler) {
    this.msgHandlers.delete(handler);
  }
}

export class MessageContext<Data, ReplyData> {
  public data: Data;

  constructor(
    public port: Runtime.Port,
    private msg: IntercomClientMessage,
    private server: IntercomServer
  ) {
    this.data = msg.data;
  }

  get connected() {
    return this.server.isConnected(this.port);
  }

  get request() {
    return this.msg.type === IntercomMessageType.Req;
  }

  reply(data: ReplyData) {
    assertRequest(this.msg);
    this.port.postMessage({
      type: IntercomMessageType.Res,
      reqId: this.msg.reqId,
      data,
    });
  }

  replyError(err: any) {
    assertRequest(this.msg);
    this.send({
      type: IntercomMessageType.Err,
      reqId: this.msg.reqId,
      data: serializeError(err),
    });
  }

  private send(res: IntercomResponse | IntercomErrorResponse) {
    if (this.connected) {
      this.port.postMessage(res);
    }
  }
}

function assertRequest(
  msg: IntercomClientMessage
): asserts msg is IntercomRequest {
  assert(
    msg.type === IntercomMessageType.Req,
    "Not allowed for non-request messages"
  );
}
