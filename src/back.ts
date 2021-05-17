import { browser } from "webextension-polyfill-ts";
import { enableTrueConsole } from "lib/true-console";
import { startServer } from "core/back/server";

enableTrueConsole();

// Start background server
// It starts Porter server to communicate with UI & content scripts
startServer();

// Open new tab with extension page after install
browser.runtime.onInstalled.addListener(({ reason }) => {
  switch (reason) {
    case "install":
      browser.tabs.create({
        url: browser.runtime.getURL("index.html"),
        active: true,
      });
      break;
  }
});

// Open new tab with extension page
// when user clicked on extension icon in toolbar
browser.browserAction.onClicked.addListener((tab) => {
  console.info(`Browser action clicked on TAB#${tab.id} [index: ${tab.index}]`);

  browser.tabs.create({
    windowId: tab.windowId,
    index: tab.index + 1,
    url: browser.runtime.getURL("index.html"),
    active: true,
  });
});

// setTimeout(async () => {
//   const [currentTab] = await browser.tabs.query({
//     currentWindow: true,
//     active: true,
//   });

//   const tab = await browser.tabs.create({
//     windowId: currentTab.windowId,
//     index: currentTab.index + 1,
//     url: browser.runtime.getURL("index.html"),
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
