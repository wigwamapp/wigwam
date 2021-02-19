import { browser } from "webextension-polyfill-ts";

browser.tabs.create({
  url: browser.runtime.getURL("index.html"),
});
window.close();
