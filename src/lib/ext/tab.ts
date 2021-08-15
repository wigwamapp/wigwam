import { browser, Tabs } from "webextension-polyfill-ts";

export function getExtensionTabs() {
  return browser.tabs.query({
    currentWindow: true,
    url: browser.runtime.getURL("**"),
  });
}

export async function getActiveTab() {
  const tabs = await browser.tabs.query({
    currentWindow: true,
    active: true,
  });
  return tabs.length > 0 ? tabs[0] : null;
}

export function onActiveTabChanged(callback: (tab: Tabs.Tab) => void) {
  const currentWindowPromise = browser.windows.getCurrent();
  currentWindowPromise.catch(console.error);

  const handleActivated = (activeInfo: Tabs.OnActivatedActiveInfoType) => {
    currentWindowPromise.then((currentWindow) => {
      if (activeInfo.windowId === currentWindow.id) {
        browser.tabs.get(activeInfo.tabId).then(callback).catch(console.error);
      }
    });
  };

  browser.tabs.onActivated.addListener(handleActivated);
  return () => browser.tabs.onActivated.removeListener(handleActivated);
}
