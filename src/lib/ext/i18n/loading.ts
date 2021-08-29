import { browser } from "webextension-polyfill-ts";

import { init } from "./core";
import { onUpdated } from "./persisting";

export const initPromise = init();

let initialized = false;
onInited(() => {
  initialized = true;
});

onUpdated(refresh);

export function onInited(callback: () => void) {
  initPromise.then(callback);
}

export function isInited() {
  return initialized;
}

async function refresh() {
  if (await isBackgroundScript()) {
    init();
  } else {
    window.location.reload();
  }
}

async function isBackgroundScript() {
  let backgroundWindow;
  try {
    backgroundWindow = await browser.runtime.getBackgroundPage();
  } catch {}
  return window === backgroundWindow;
}
