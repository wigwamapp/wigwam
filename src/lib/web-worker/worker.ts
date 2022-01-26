import { expose as threadsExpose } from "threads/worker";

import { notifyWorkerSpawned } from "./hot-reload";

export const expose: typeof threadsExpose = (...args) => {
  notifyWorkerSpawned();
  return threadsExpose(...args);
};
