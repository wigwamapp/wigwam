import browser from "webextension-polyfill";

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

function refresh() {
  if (isBackgroundScript()) {
    init();
  } else {
    window.location.reload();
  }
}

function isBackgroundScript() {
  return !("getBackgroundPage" in browser.runtime);
}
