/* eslint-disable */

import { Emitter } from "lib/emitter";
import { IntercomClient } from "lib/ext/intercom/client";
import { assert } from "lib/system/assert";
import { MessageType, Request, Response } from "core/types";

const intercom = new IntercomClient<Request, Response>("CONTENT_SCRIPT");

(async () => {
  try {
    const res = await intercom.request(
      { type: MessageType.GetWalletStatus },
      5_000
    );
    assert(res?.type === MessageType.GetWalletStatus);
    console.info(res.status);
  } catch (err) {
    console.error(err);
  }
})();

interface RequestArguments {
  readonly method: string;
  readonly params?: readonly unknown[] | Record<string, unknown>;
}

// interface ProviderRpcError extends Error {
//   message: string;
//   code: number;
//   data?: unknown;
// }

class Ethereum extends Emitter {
  async enable() {}

  async request(_req: RequestArguments) {}
}

// console.info(import.meta.env.SNOWPACK_PUBLIC_DEBUG);
