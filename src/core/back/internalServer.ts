import { browser, Runtime } from "webextension-polyfill-ts";

export type ServerMessageHandler = (msg: any, port: Runtime.Port) => any;

export class IntercomServer {
  private ports = new Set<Runtime.Port>();
  private msgHandlers = new Set<ServerMessageHandler>();

  constructor() {
    browser.runtime.onConnect.addListener((port) => {
      this.addPort(port);

      port.onDisconnect.addListener(() => {
        this.removePort(port);
      });
    });

    this.handleMessage = this.handleMessage.bind(this);
  }

  onMessage(handler: ServerMessageHandler) {
    this.addMessageHandler(handler);
    return () => this.removeMessageHandler(handler);
  }

  isConnected(port: Runtime.Port) {
    return this.ports.has(port);
  }

  private handleMessage(msg: any, port: Runtime.Port) {
    if (port.sender?.id === browser.runtime.id) {
      for (const handler of this.msgHandlers) {
        try {
          handler(msg, port);
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

  private addMessageHandler(handler: ServerMessageHandler) {
    this.msgHandlers.add(handler);
  }

  private removeMessageHandler(handler: ServerMessageHandler) {
    this.msgHandlers.delete(handler);
  }
}
