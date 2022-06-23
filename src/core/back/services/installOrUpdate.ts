import browser from "webextension-polyfill";
import { getMainURL, openOrFocusMainTab } from "lib/ext/utils";
import * as Global from "lib/ext/global";

const WEBSITE_URL = process.env.VIGVAM_WEBSITE_ORIGIN;
const BETATEST_PROMOCODES =
  process.env.VIGVAM_BETATEST_PROMOCODES?.split(",") ?? [];

export function startInstallOrUpdateListener() {
  let websiteTabId: number | undefined;

  // Open new tab with extension page after install
  browser.runtime.onInstalled.addListener(({ reason }) => {
    if (reason === "install") {
      browser.tabs.create({
        url: getMainURL(),
        active: true,
      });
    }

    if (reason === "install" || reason === "update") {
      browser.tabs
        .query({ url: `${WEBSITE_URL}/**` })
        .then((tabs) => {
          const tabId = tabs[0]?.id;
          if (tabId) {
            return browser.tabs.reload(tabId);
          }

          if (reason === "install") {
            return browser.tabs.create({ url: WEBSITE_URL }).then((tab) => {
              websiteTabId = tab.id;
            });
          }

          return;
        })
        .catch(console.error);
    }
  });

  // To open app from landing page
  browser.runtime.onMessage.addListener((msg) => {
    if (msg?.type === "__OPEN_OR_FOCUS_TAB") {
      openOrFocusMainTab().catch(console.error);
    }
  });

  // To pass promocode from landing page
  browser.runtime.onMessage.addListener((msg) => {
    if (
      msg?.type === "__APPLY_WEBSITE_DATA" &&
      msg.data &&
      typeof msg.data === "object"
    ) {
      try {
        const { betatestPromocode } = msg.data;

        if (betatestPromocode && typeof betatestPromocode === "string") {
          const code = betatestPromocode.toLowerCase();

          if (
            BETATEST_PROMOCODES.includes(code) &&
            !Global.get("betatest_promocode")
          ) {
            Global.put("betatest_promocode", code);
          }
        }
      } catch (err) {
        console.error(err);
      }

      if (websiteTabId) {
        browser.tabs.remove(websiteTabId).catch(console.error);
        websiteTabId = undefined;
      }
    }
  });

  browser.runtime.onUpdateAvailable?.addListener(({ version }) => {
    Global.put("latest_version", version);
  });
}
