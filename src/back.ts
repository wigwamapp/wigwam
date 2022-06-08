import browser from "webextension-polyfill";
import BigNumber from "bignumber.js";
import { initProfiles } from "lib/ext/profile";
import { getMainURL, openOrFocusMainTab } from "lib/ext/utils";
import { setupArgon2Impl } from "lib/kdbx";

import { setupFixtures } from "core/repo";
import { startServer } from "core/back/server";

BigNumber.set({ EXPONENTIAL_AT: 38 });

setupArgon2Impl();

// Init profiles
// - Create default profile if it doesn't exist
// - Open new tab when profile changed (after refresh)
initProfiles();

// Setup fixtures
setupFixtures();

// Start background server
// It starts Porter server to communicate with UI & content scripts
startServer();

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
      .query({ url: `${process.env.VIGVAM_WEBSITE_ORIGIN}/**` })
      .then((tabs) => {
        const tabId = tabs[0]?.id;
        tabId && browser.tabs.reload(tabId);
      })
      .catch(() => undefined);
  }
});

browser.runtime.onMessage.addListener((msg) => {
  if (msg?.type === "__OPEN_OR_FOCUS_TAB") {
    openOrFocusMainTab().catch(console.error);
  }
});
