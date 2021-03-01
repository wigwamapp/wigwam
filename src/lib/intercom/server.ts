import { browser, Runtime } from "webextension-polyfill-ts";
import {
  IntercomMessageType,
  IntercomRequest,
  IntercomResponse,
  IntercomError,
} from "./types";

export type ServerMessageHandler<ReqData, ResData> = (
  ctx: RequestContext<ReqData, ResData>
) => void;

export class IntercomServer<ReqData = any, ResData = any> {
  private ports = new Set<Runtime.Port>();
  private msgHandlers = new Set<ServerMessageHandler<ReqData, ResData>>();

  constructor() {
    browser.runtime.onConnect.addListener((port) => {
      this.addPort(port);

      port.onDisconnect.addListener(() => {
        this.removePort(port);
      });
    });

    this.handleMessage = this.handleMessage.bind(this);
  }

  onMessage(handler: ServerMessageHandler<ReqData, ResData>) {
    this.addMessageHandler(handler);
    return () => this.removeMessageHandler(handler);
  }

  isConnected(port: Runtime.Port) {
    return this.ports.has(port);
  }

  private handleMessage(msg: any, port: Runtime.Port) {
    if (port.sender?.id === browser.runtime.id) {
      const ctx = new RequestContext<ReqData, ResData>(port, msg, this);
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

  private addMessageHandler(handler: ServerMessageHandler<ReqData, ResData>) {
    this.msgHandlers.add(handler);
  }

  private removeMessageHandler(
    handler: ServerMessageHandler<ReqData, ResData>
  ) {
    this.msgHandlers.delete(handler);
  }
}

class RequestContext<ReqData, ResData> {
  public data: ReqData;

  constructor(
    public port: Runtime.Port,
    private request: IntercomRequest,
    private server: IntercomServer
  ) {
    this.data = request.data;
  }

  get connected() {
    return this.server.isConnected(this.port);
  }

  reply(data: ResData) {
    this.port.postMessage({
      type: IntercomMessageType.Res,
      reqId: this.request.reqId,
      data,
    });
  }

  replyError(err: any) {
    this.send({
      type: IntercomMessageType.Err,
      reqId: this.request.reqId,
      data: serealizeError(err),
    });
  }

  private send(msg: IntercomResponse | IntercomError) {
    if (this.connected) {
      this.port.postMessage(msg);
    }
  }
}

function serealizeError(err: any) {
  return err.message;
}
