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
        case "wigwam.reply":
          ext.runtime.sendMessage({
            type: "__APPLY_WEBSITE_DATA",
            data: evt.data.data,
          });
          break;

        case "wigwam.openapp":
          ext.runtime.sendMessage({ type: "__OPEN_OR_FOCUS_TAB" });
          break;

        default:
          break;
      }
    }
  },
  false,
);

window.addEventListener("load", () => {
  window.postMessage(
    {
      type: "wigwam.version",
      extId,
      version,
      salt,
    },
    location.origin,
  );
});
