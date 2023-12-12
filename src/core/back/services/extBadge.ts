import browser from "webextension-polyfill";
import memoizeOne from "memoize-one";

import { $approvals } from "../state";

export async function startExtBadge() {
  // Reset after init
  browser.action.setBadgeText({ text: "" }).catch(console.warn);

  $approvals.watch(async (approvals) => {
    try {
      await setBadgeBackgroundColor();
      await browser.action.setBadgeText({
        text: approvals.length > 0 ? `+${approvals.length}` : "",
      });
    } catch (err) {
      console.warn(err);
    }
  });
}

const setBadgeBackgroundColor = memoizeOne(() =>
  browser.action.setBadgeBackgroundColor({ color: "#181A1F" }),
);
