import { PorterClient } from "lib/ext/porter/client";

import { PorterChannel } from "core/types/shared";
import { JSONRPC, DISCONNECT_ERROR, WIGWAM_FAVICON } from "core/common/rpc";
import { shouldInject } from "core/inpage/shouldInject";
import { InpageProtocol } from "core/inpage/protocol";

if (shouldInject()) {
  initMsgGateway();
}

function initMsgGateway() {
  const inpage = new InpageProtocol("content", "injected");

  const porter = new PorterClient();
  porter.connect(PorterChannel.Page);
  porter.onFullyDisconnect = () => {
    if (
      process.env.NODE_ENV === "development" &&
      process.env.WIGWAM_DEV_ACTIVE_TAB_RELOAD === "true"
    ) {
      // Wait for the fresh content script to be loaded
      // via browser.scripting.registerContentScripts()
      setTimeout(() => location.reload(), 300);
      return;
    }

    console.error(
      "Wigwam: Provider disconnected." +
        " A page reload is required to reestablish the connection.",
    );
  };

  // Redirect messages: Background --> Injected
  porter.onOneWayMessage((msg) => {
    inpage.send(msg);
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

  window.addEventListener("load", () => {
    try {
      const favIconUrl = getFavicon();

      if (favIconUrl) {
        porter.sendOneWayMessage({
          jsonrpc: JSONRPC,
          method: WIGWAM_FAVICON,
          params: [favIconUrl],
        });
      }
    } catch (err) {
      console.error(err);
    }
  });
}

function getFavicon(): string | null {
  const el =
    document.querySelector('link[sizes="192x192"]') ||
    document.querySelector('link[sizes="180x180"]') ||
    document.querySelector('link[rel="icon"]') ||
    document.querySelector('link[rel="shortcut icon"]');

  const { protocol, host, pathname } = document.location;
  let href = el ? el.getAttribute("href") : null;

  if (!href || href.startsWith("javascript:")) {
    return null;
  }

  if (
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("data:")
  ) {
    return href;
  }

  if (href.startsWith("//")) {
    return protocol + href;
  }

  if (!href.startsWith("/")) {
    href = `${pathname.endsWith("/") ? pathname : `${pathname}/`}${href}`;
  }

  return `${protocol}//${host}${href}`;
}
