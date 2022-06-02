import browser from "webextension-polyfill";
import { PorterClient } from "lib/ext/porter/client";

import { PorterChannel } from "core/types/shared";
import { JSONRPC, DISCONNECT_ERROR } from "core/common/rpc";
import { shouldInject } from "core/inpage/shouldInject";
import { InpageProtocol } from "core/inpage/protocol";

if (shouldInject()) {
  const injected = injectScript(browser.runtime.getURL("scripts/inpage.js"));
  injected && initMsgGateway(injected);
}

function initMsgGateway(injected: Promise<void>) {
  const inpage = new InpageProtocol("content", "injected");

  const porter = new PorterClient();
  porter.connect(PorterChannel.Page);
  porter.onFullyDisconnect = () => {
    if (process.env.NODE_ENV === "development") {
      location.reload();
      return;
    }

    console.error(
      "Vigvam: Provider disconnected." +
        " A page reload is required to reestablish the connection."
    );
  };

  // Redirect messages: Background --> Injected
  porter.onOneWayMessage((msg) => {
    injected.then(() => inpage.send(msg));
  });

  // Redirect messages: Injected --> Background
  inpage.subscribe((msg) => {
    try {
      porter.sendOneWayMessage(msg);
    } catch (err) {
      console.error(err);

      if (msg?.jsonrpc === JSONRPC && msg.id) {
        inpage.send({
          id: msg.id,
          jsonrpc: JSONRPC,
          error: DISCONNECT_ERROR,
        });
      }
    }
  });
}

function injectScript(src: string) {
  try {
    const container = document.head || document.documentElement;
    const script = document.createElement("script");
    script.setAttribute("async", "false");
    script.src = src;
    container.insertBefore(script, container.children[0]);
    container.removeChild(script);

    return new Promise<void>((res) =>
      script.addEventListener("load", () => res(), true)
    );
  } catch (err) {
    console.error("Vigvam: Provider injection failed.", err);
    return null;
  }
}
