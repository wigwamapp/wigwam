import browser from "webextension-polyfill";
import memoizeOne from "memoize-one";

import { $approvals } from "../state";

export async function startExtBadge() {
  $approvals.watch(async (approvals) => {
    try {
      await setBadgeBackgroundColor();
      await browser.browserAction.setBadgeText({
        text: approvals.length > 0 ? `+${approvals.length}` : "",
      });
    } catch {}
  });
}

const setBadgeBackgroundColor = memoizeOne(() =>
  browser.browserAction.setBadgeBackgroundColor({ color: "#101123" })
);