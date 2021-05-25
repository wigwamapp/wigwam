import { browser } from "webextension-polyfill-ts";

export function getExtensionTabs() {
  return browser.tabs.query({
    currentWindow: true,
    url: browser.runtime.getURL("**"),
  });
}
