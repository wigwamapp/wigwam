import browser from "webextension-polyfill";
import { getMainURL } from "lib/ext/utils";

// Open new tab with extension page after install
browser.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === "install") {
    browser.tabs.create({
      url: getMainURL(),
      active: true,
    });
  }
});
