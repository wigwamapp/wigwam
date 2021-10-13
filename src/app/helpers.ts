import browser from "webextension-polyfill";

import { isPopup } from "lib/ext/view";
import { getMainURL } from "lib/ext/utils";
import { Destination, toHash, navigate } from "lib/navigation";

export async function openInTab(to?: Destination) {
  if (!isPopup()) {
    to && navigate(to);
    return;
  }

  try {
    const hash = to && toHash(to);

    const mainTabs = await browser.tabs.query({
      currentWindow: true,
      url: getMainURL("**"),
    });

    const url = getMainURL(`#${hash ?? ""}`);

    if (mainTabs.length > 0) {
      const tab = mainTabs[0];
      browser.tabs.update(
        tab.id,
        tab.url === url ? { active: true } : { url, active: true }
      );
    } else {
      browser.tabs.create({ url, active: true });
    }
  } catch (err) {
    console.error(err);
  }

  window.close();
}
