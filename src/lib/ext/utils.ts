import browser from "webextension-polyfill";

import * as Global from "./global";

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

export async function restartApp() {
  // Open empty tab if there are only one tab and this tab is Vigvam
  // because after reload this tab will be removed
  try {
    const tabs = await browser.tabs.query({ url: getMainURL() });

    if (tabs.length === 1 && tabs[0].index === 0) {
      await browser.tabs.create({});
    }
  } catch {}

  browser.runtime.reload();
}

export function isUpdateAvailable(
  currentVersion: string,
  latestVersion: string
) {
  if (currentVersion === latestVersion) return false;

  try {
    const compared = latestVersion.localeCompare(currentVersion, undefined, {
      numeric: true,
      sensitivity: "base",
    });

    return compared === 1;
  } catch {
    return false;
  }
}
