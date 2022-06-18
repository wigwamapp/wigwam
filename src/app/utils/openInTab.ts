import browser from "webextension-polyfill";

export async function openInTabExternal(url: string, tabId?: number) {
  try {
    let exist = false;
    if (tabId !== undefined) {
      exist = Boolean(await browser.tabs.get(tabId).catch(() => null));
    }
    if (exist) {
      await browser.tabs.update(tabId, { highlighted: true });
    } else {
      await browser.tabs.create({ url, active: true });
    }
  } catch (e) {
    console.error(e);
  }
}
