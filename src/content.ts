/* eslint-disable */

// import { PorterClient } from "lib/ext/porter/client";
// import { assert } from "lib/system/assert";
// import { MessageType, Request, Response } from "core/types";

// const porter = new PorterClient<Request, Response>("CONTENT_SCRIPT");

// (async () => {
//   try {
//     const res = await porter.request(
//       { type: MessageType.GetWalletStatus },
//       5_000
//     );
//     assert(res?.type === MessageType.GetWalletStatus);
//     console.info(res.status);
//   } catch (err) {
//     console.error(err);
//   }
// })();

import { browser } from "webextension-polyfill-ts";

import { Emitter } from "lib/emitter";
import { PorterClient } from "lib/ext/porter/client";
import { PorterChannel } from "core/types/shared";

interface RequestArguments {
  readonly method: string;
  readonly params?: readonly unknown[] | Record<string, unknown>;
}

interface ProviderMessage {
  readonly type: string;
  readonly data: unknown;
}

interface EthSubscription extends ProviderMessage {
  readonly type: "eth_subscription";
  readonly data: {
    readonly subscription: string;
    readonly result: unknown;
  };
}

interface ProviderConnectInfo {
  readonly chainId: string;
}

class ProviderRpcError extends Error {
  name = "ProviderRpcError";

  constructor(public code: number, public data?: unknown) {
    super(PROVIDER_ERRORS[code] ?? "Unknown error occurred");
  }
}

const PROVIDER_ERRORS: Record<number, string> = {
  4001: "The user rejected the request",
  4100: "The requested method and/or account has not been authorized by the user",
  4200: "The Provider does not support the requested method",
  4900: "The Provider is disconnected from all chains",
  4901: "The Provider is not connected to the requested chain",
};

class Ethereum extends Emitter<ProviderMessage> {
  async enable() {}

  async request(_req: RequestArguments) {}
}

let porter: PorterClient;
function getPorter() {
  if (!porter) {
    porter = new PorterClient(PorterChannel.DApp);
  }
  return porter;
}

injectScript(browser.runtime.getURL("scripts/inpage.js"));

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
