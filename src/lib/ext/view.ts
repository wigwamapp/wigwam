import browser from "webextension-polyfill";
import memoizeOne from "memoize-one";

export const isPopup = memoizeOne(() => {
  const popups = browser.extension.getViews({ type: "popup" });
  return popups.includes(window);
});
