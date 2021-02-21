import { browser } from "webextension-polyfill-ts";

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
  browser.tabs.create({
    windowId: tab.windowId,
    index: tab.index + 1,
    url: browser.runtime.getURL("index.html"),
    active: true,
  });
});

// Hot Module Replacement (HMR) - Remove this snippet to remove HMR.
// Learn more: https://snowpack.dev/concepts/hot-module-replacement
if (import.meta.hot) {
  import.meta.hot.accept();
}

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
