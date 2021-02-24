/* eslint-disable */

import { Emitter } from "lib/emitter";

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
