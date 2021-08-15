import { browser } from "webextension-polyfill-ts";
import memoize from "mem";

export const isPopup = memoize(() => {
  const popups = browser.extension.getViews({ type: "popup" });
  return popups.includes(window);
});
