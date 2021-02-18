import { browser } from "webextension-polyfill-ts";

setTimeout(async () => {
  const [currentTab] = await browser.tabs.query({
    currentWindow: true,
    active: true,
  });

  const tab = await browser.tabs.create({
    windowId: currentTab.windowId,
    index: currentTab.index + 1,
    url: browser.runtime.getURL("index.html"),
    active: true,
    openerTabId: currentTab.id,
  });

  setTimeout(() => {
    browser.tabs.remove(tab.id!);
  }, 5_000);

  // await browser.windows.create({
  //   type: "popup",
  //   tabId: currentTab.id,
  //   focused: true,
  //   width: 500,
  //   height: 500,
  //   top: 20,
  //   left: 20,
  // });
}, 5_000);
