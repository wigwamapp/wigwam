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
      evt.data?.type === "vigvam.openapp" &&
      evt.data.salt === salt
    ) {
      ext.runtime.sendMessage({ type: "__OPEN_OR_FOCUS_TAB" });
    }
  },
  false
);

window.postMessage(
  {
    type: "vigvam.version",
    extId,
    version,
    salt,
  },
  location.origin
);
