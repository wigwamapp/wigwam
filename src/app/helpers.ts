import { browser } from "webextension-polyfill-ts";

import { getExtensionTabs } from "lib/ext/tab";
import { isPopup } from "lib/ext/view";
import { Destination, toHash, navigate } from "lib/navigation";

export async function openInTab(to?: Destination) {
  if (!isPopup()) {
    to && navigate(to);
    return;
  }

  try {
    const url = browser.runtime.getURL(
      `main.html${to ? `#${toHash(to)}` : ""}`
    );
    const params = { url, active: true };

    const extTabs = await getExtensionTabs();
    if (extTabs.length > 0) {
      browser.tabs.update(extTabs[0].id, params);
    } else {
      browser.tabs.create(params);
    }
  } catch (err) {
    console.error(err);
  }

  window.close();
}
