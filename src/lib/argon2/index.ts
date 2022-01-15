import { createWorker } from "lib/web-worker";

import type * as Argon2 from "argon2-browser";

const { perform } = createWorker<Omit<typeof Argon2, "ArgonType">>(
  () => new Worker(new URL("./worker", import.meta.url))
);

export const hash: typeof Argon2["hash"] = (params) =>
  perform((worker) => worker.hash(params));

export const verify: typeof Argon2["verify"] = (params) =>
  perform((worker) => worker.verify(params));
