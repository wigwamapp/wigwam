import browser from "webextension-polyfill";
import { PorterClient } from "lib/ext/porter/client";

import { PorterChannel } from "core/types/shared";
import { shouldInject } from "core/inpage/shouldInject";
import { InpageProtocol } from "core/inpage/protocol";

if (shouldInject()) {
  injectScript(browser.runtime.getURL("scripts/inpage.js"));
  initMsgGateway();
}

function initMsgGateway() {
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

  const inpage = new InpageProtocol("content", "injected");

  let firstMsg: any;

  // Redirect messages: Background --> Injected
  porter.onOneWayMessage((msg) => {
    if (!firstMsg) {
      firstMsg = msg;
      return;
    }

    inpage.send(msg);
  });

  // Redirect messages: Injected --> Background
  inpage.subscribe((msg) => {
    if (msg === "inited" && firstMsg) {
      inpage.send(firstMsg);
      return;
    }

    try {
      porter.sendOneWayMessage(msg);
    } catch (err) {
      console.error(err);
      // TODO: Handle disconnect error,
      // and reply with rpc corresponding rpc error
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
  } catch (err) {
    console.error("Vigvam: Provider injection failed.", err);
  }
}
