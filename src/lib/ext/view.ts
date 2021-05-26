import { browser } from "webextension-polyfill-ts";

export function isPopup() {
  const popups = browser.extension.getViews({ type: "popup" });
  return popups.includes(window);
}
