import browser from "webextension-polyfill";

import { openTabIfProfileChanged } from "lib/ext/profile";
import { getMainURL } from "lib/ext/utils";
import { setupFixtures } from "core/repo";
import { startServer } from "core/back/server";

// Setup fixtures
setupFixtures();

// Start background server
// It starts Porter server to communicate with UI & content scripts
startServer();

// Open new tab when profile changed (after reset)
openTabIfProfileChanged();

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

// for (const _i of [1, 2, 3, 4, 5, 6, 7, 8]) {
//   new Worker(new URL("./worker", import.meta.url));
// }

// setTimeout(async () => {
//   const [currentTab] = await browser.tabs.query({
//     currentWindow: true,
//     active: true,
//   });

//   const tab = await browser.tabs.create({
//     windowId: currentTab.windowId,
//     index: currentTab.index + 1,
//     url: browser.runtime.getURL("main.html"),
//     active: true,
//     openerTabId: currentTab.id,
//   });

//   setTimeout(() => {
//     browser.tabs.remove(tab.id!);
//   }, 5_000);

//   // await browser.windows.create({
//   //   type: "popup",
//   //   tabId: currentTab.id,
//   //   focused: true,
//   //   width: 500,
//   //   height: 500,
//   //   top: 20,
//   //   left: 20,
//   // });
// }, 5_000);
