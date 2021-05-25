import { browser } from "webextension-polyfill-ts";

import { getExtensionTabs } from "lib/ext/tab";

export async function openInTab() {
  try {
    const extTabs = await getExtensionTabs();
    if (extTabs.length > 0) {
      browser.tabs.update(extTabs[0].id, {
        active: true,
      });
    } else {
      browser.tabs.create({
        url: browser.runtime.getURL("index.html"),
        active: true,
      });
    }
  } catch (err) {
    console.error(err);
  }

  window.close();
}
