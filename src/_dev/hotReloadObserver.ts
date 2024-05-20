import browser from "webextension-polyfill";

const HOTRELOAD_TAB_URL = browser.runtime.getURL("hotreload.html");

initHotReloadTab().catch(console.error);

async function initHotReloadTab() {
  try {
    const existing = await browser.tabs.query({
      url: `${HOTRELOAD_TAB_URL}**`,
    });

    if (existing.length > 0) {
      await browser.tabs.remove(existing.map((t) => t.id!));
    }
  } catch (err) {
    console.warn(err);
  }

  await browser.tabs.create({
    url: HOTRELOAD_TAB_URL,
    active: false,
    index: 0,
  });
}
