import { nanoid } from "nanoid";

declare const browser: any;

const ext = chrome ?? browser;
const extId = ext.runtime.id;
const version = process.env.VERSION;
const salt = nanoid();

window.addEventListener(
  "message",
  (evt) => {
    if (
      evt.source === window &&
      evt.origin === location.origin &&
      evt.data?.salt === salt
    ) {
      switch (evt.data.type) {
        case "og.reply":
          ext.runtime.sendMessage({
            type: "__APPLY_WEBSITE_DATA",
            data: evt.data.data,
          });
          break;

        case "og.openapp":
          ext.runtime.sendMessage({ type: "__OPEN_OR_FOCUS_TAB" });
          break;

        default:
          break;
      }
    }
  },
  false,
);

// TODO REBRANDING: website (ogwallet.tech) must be updated to send/expect
// "og.reply"/"og.openapp"/"og.version" message types instead of "wigwam.*"
window.addEventListener("load", () => {
  window.postMessage(
    {
      type: "og.version",
      extId,
      version,
      salt,
    },
    location.origin,
  );
});
