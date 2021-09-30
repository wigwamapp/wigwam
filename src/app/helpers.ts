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

    let mainTabs = await browser.tabs.query({
      currentWindow: true,
      url: getMainURL("**"),
    });
    if (hash) {
      mainTabs = mainTabs.filter((t) => t.url?.includes(hash));
    }

    if (mainTabs.length > 0) {
      browser.tabs.update(mainTabs[0].id, { active: true });
    } else {
      const url = getMainURL(hash && `#${hash}`);
      browser.tabs.create({ url, active: true });
    }
  } catch (err) {
    console.error(err);
  }

  window.close();
}
