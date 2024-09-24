import browser from "webextension-polyfill";
import { getMainURL, openOrFocusMainTab } from "lib/ext/utils";
import { globalStorage } from "lib/ext/globalStorage";

import { LATEST_VERSION } from "core/types/storage";

const WEBSITE_URL = process.env.WIGWAM_WEBSITE_ORIGIN;

export function startInstallOrUpdateListener() {
  // let websiteTabId: number | undefined;

  // Open new tab with extension page after install
  browser.runtime.onInstalled.addListener(({ reason }) => {
    if (reason === "install") {
      browser.tabs.create({
        url: getMainURL(),
        active: true,
      });
    }

    if (WEBSITE_URL && ["install", "update"].includes(reason)) {
      browser.tabs
        .query({ url: `${WEBSITE_URL}/**` })
        .then((tabs) => {
          const tabId = tabs[0]?.id;
          if (tabId) {
            return browser.tabs.reload(tabId);
          }

          // Can be used to pass data from a website to an extension
          //
          // if (reason === "install") {
          //   return browser.tabs.create({ url: WEBSITE_URL }).then((tab) => {
          //     websiteTabId = tab.id;
          //   });
          // }

          return;
        })
        .catch(console.error);
    }
  });

  // To open app from landing page
  browser.runtime.onMessage.addListener((msg: any): undefined => {
    if (msg?.type === "__OPEN_OR_FOCUS_TAB") {
      openOrFocusMainTab().catch(console.error);
    }
  });

  // To pass data from a website to an extension
  //
  // browser.runtime.onMessage.addListener((msg) => {
  //   if (
  //     msg?.type === "__APPLY_WEBSITE_DATA" &&
  //     msg.data &&
  //     typeof msg.data === "object"
  //   ) {
  //     try {
  //       const {} = msg.data;
  //     } catch (err) {
  //       console.error(err);
  //     }
  //
  //     if (websiteTabId) {
  //       browser.tabs.remove(websiteTabId).catch(console.error);
  //       websiteTabId = undefined;
  //     }
  //   }
  // });

  browser.runtime.requestUpdateCheck().catch(console.error);

  browser.runtime.onUpdateAvailable?.addListener(({ version }) => {
    globalStorage.put(LATEST_VERSION, version).catch(console.error);
  });
}
