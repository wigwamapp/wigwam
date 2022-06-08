import browser from "webextension-polyfill";

export const getPublicURL = browser.runtime.getURL;

export function getMainURL(path = "") {
  return getPublicURL(`main.html${path}`);
}

export function openMainTab() {
  return browser.tabs.create({
    url: getMainURL(),
    active: true,
  });
}

export async function openOrFocusMainTab() {
  const tabs = await browser.tabs.query({ url: getMainURL() });
  if (tabs.length > 0) {
    return browser.tabs.update(tabs[0].id!, { active: true });
  }

  return openMainTab();
}
