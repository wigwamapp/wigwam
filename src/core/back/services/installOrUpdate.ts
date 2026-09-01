import browser from "webextension-polyfill";
import { getMainURL, openOrFocusMainTab } from "lib/ext/utils";
import { globalStorage } from "lib/ext/globalStorage";

import { LATEST_VERSION } from "core/types/storage";

export function startInstallOrUpdateListener() {
  // Open new tab with extension page after install
  browser.runtime.onInstalled.addListener(({ reason }) => {
    if (reason === "install") {
      browser.tabs.create({
        url: getMainURL(),
        active: true,
      });
    }
  });

  // To open app from landing page
  browser.runtime.onMessage.addListener((msg: any): undefined => {
    if (msg?.type === "__OPEN_OR_FOCUS_TAB") {
      openOrFocusMainTab().catch(console.error);
    }
  });

  browser.runtime.requestUpdateCheck().catch(console.error);

  browser.runtime.onUpdateAvailable?.addListener(({ version }) => {
    globalStorage.put(LATEST_VERSION, version).catch(console.error);
  });
}
