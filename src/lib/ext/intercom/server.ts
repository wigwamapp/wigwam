import { browser, Runtime } from "webextension-polyfill-ts";
import { assert } from "lib/system/assert";
import {
  IntercomMessageType,
  IntercomClientMessage,
  IntercomRequest,
  IntercomResponse,
  IntercomError,
} from "./types";
import { serializeError } from "./helpers";

export type IntercomServerHandler<ReqData, ResData> = (
  ctx: MessageContext<ReqData, ResData>
) => void;

export class IntercomServer<Data = any, ReplyData = any> {
  private ports = new Set<Runtime.Port>();
  private msgHandlers = new Set<IntercomServerHandler<Data, ReplyData>>();

  constructor() {
    browser.runtime.onConnect.addListener((port) => {
      this.addPort(port);

      port.onDisconnect.addListener(() => {
        this.removePort(port);
      });
    });

    this.handleMessage = this.handleMessage.bind(this);
  }

  onMessage(handler: IntercomServerHandler<Data, ReplyData>) {
    this.addMessageHandler(handler);
    return () => this.removeMessageHandler(handler);
  }

  isConnected(port: Runtime.Port) {
    return this.ports.has(port);
  }

  private handleMessage(msg: any, port: Runtime.Port) {
    if (
      port.sender?.id === browser.runtime.id &&
      msg?.type in IntercomMessageType
    ) {
      const ctx = new MessageContext<Data, ReplyData>(
        port,
        msg as IntercomClientMessage,
        this
      );

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

  private addMessageHandler(handler: IntercomServerHandler<Data, ReplyData>) {
    this.msgHandlers.add(handler);
  }

  private removeMessageHandler(
    handler: IntercomServerHandler<Data, ReplyData>
  ) {
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

  private send(res: IntercomResponse | IntercomError) {
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
