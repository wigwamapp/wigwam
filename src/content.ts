import { browser } from "webextension-polyfill-ts";

const kek = async () => {
  const [currentTab] = await browser.tabs.query({
    currentWindow: true,
    active: true,
  });

  await browser.tabs.create({
    windowId: currentTab.windowId,
    index: currentTab.index + 1,
    url: browser.runtime.getURL("index.html"),
    active: true,
    pinned: true,
    openerTabId: currentTab.id,
  });
};

window.addEventListener("message", (evt) => {
  if (evt.source !== window) return;

  if (evt.data?.type === "kek") {
    kek();
  }
});
