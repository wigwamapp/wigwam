import browser from "webextension-polyfill";
import { getMainURL, openOrFocusMainTab } from "lib/ext/utils";

export function startInstallOrUpdateListener() {
  // Open new tab with extension page after install
  browser.runtime.onInstalled.addListener(({ reason }) => {
    if (reason === "install") {
      browser.tabs.create({
        url: getMainURL(),
        active: true,
      });
    }

    if (reason === "install" || reason === "update") {
      browser.tabs
        .query({ url: `${process.env.VIGVAM_WEBSITE_ORIGIN}/**` })
        .then((tabs) => {
          const tabId = tabs[0]?.id;
          tabId && browser.tabs.reload(tabId);
        })
        .catch(() => undefined);
    }
  });

  // To open app from landing page
  browser.runtime.onMessage.addListener((msg) => {
    if (msg?.type === "__OPEN_OR_FOCUS_TAB") {
      openOrFocusMainTab().catch(console.error);
    }
  });
}
