import browser, { Tabs } from "webextension-polyfill";
import { getPublicURL, openOrFocusMainTab } from "lib/ext/utils";
import { livePromise } from "lib/system/livePromise";
import { createQueue } from "lib/system/queue";

import { Approval } from "core/types";

import { $approvals, approvalAdded } from "../state";

const APPROVE_WINDOW_URL = getPublicURL("approve.html");
const WINDOW_POSITION =
  process.env.NODE_ENV === "development" ? "center" : "top-right";

const enqueueOpenApprove = createQueue();

export function startApproveWindowOpener() {
  browser.runtime.onMessage.addListener((msg) => {
    if (msg === "__OPEN_APPROVE_WINDOW") {
      openApproveWindow();

      const currentApproval = $approvals.getState()[0];
      if (currentApproval) {
        focusApprovalTab(currentApproval);
      }
    }
  });

  approvalAdded.watch(() => openApproveWindow());

  $approvals.watch(async (approvals) => {
    if (approvals.length === 0) {
      try {
        const currentTab = await loadCurrentApproveTab();
        if (currentTab) {
          await browser.tabs.remove(currentTab.id!);
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      focusApprovalTab(approvals[0]);
    }
  });
}

export const openApproveWindow = () =>
  enqueueOpenApprove(async () => {
    if ($approvals.getState().length === 0) return;

    try {
      const currentTab = await loadCurrentApproveTab();

      if (currentTab) {
        await browser.windows.update(currentTab.windowId!, {
          focused: true,
        });
      } else {
        await createApproveWindow(WINDOW_POSITION);
      }
    } catch (err) {
      console.error(err);
    }
  });

const loadCurrentApproveTab = livePromise<Tabs.Tab | null>(
  () => Promise.resolve(undefined),
  (callback) => {
    let currentTabId: number | null = null;

    pickCurrentApproveTab()
      .then((tab) => {
        if (currentTabId === null) {
          callback(tab);

          if (tab) {
            currentTabId = tab.id!;
          }
        }
      })
      .catch((err) => {
        console.error(err);

        if (currentTabId === null) {
          callback(null);
        }
      });

    const handleTabCreated = (tab: Tabs.Tab) => {
      const tabUrl = tab.url || tab.pendingUrl;

      if (tabUrl?.startsWith(APPROVE_WINDOW_URL)) {
        if (currentTabId !== null) {
          browser.tabs.remove(currentTabId).catch(console.error);
        }

        currentTabId = tab.id!;
        callback(tab);
      }
    };

    const handleTabRemoved = (tabId: number) => {
      if (tabId === currentTabId) {
        currentTabId = null;
        callback(null);
      }
    };

    browser.tabs.onCreated.addListener(handleTabCreated);
    browser.tabs.onRemoved.addListener(handleTabRemoved);

    return () => {
      browser.tabs.onCreated.removeListener(handleTabCreated);
      browser.tabs.onRemoved.removeListener(handleTabRemoved);
    };
  }
);

function focusApprovalTab(currentApproval: Approval) {
  if (currentApproval.source.type === "page") {
    if (currentApproval.source.tabId) {
      browser.tabs
        .update(currentApproval.source.tabId, {
          highlighted: true,
        })
        .catch(console.error);
    }
  } else {
    openOrFocusMainTab();
  }
}

async function pickCurrentApproveTab() {
  const approveTabs = await browser.tabs.query({
    url: `${APPROVE_WINDOW_URL}*`,
  });

  if (approveTabs.length > 1) {
    try {
      await browser.tabs.remove(approveTabs.map(({ id }) => id!));
    } catch {}

    return null;
  }

  return approveTabs[0] ?? null;
}

async function createApproveWindow(position: "center" | "top-right") {
  const width = 440;
  const height = 660;

  let left = 0;
  let top = 0;
  try {
    const lastFocused = await browser.windows.getLastFocused();

    if (position === "top-right") {
      left = lastFocused.left! + (lastFocused.width! - width) - 16;
      top = lastFocused.top! + 16;
    } else {
      left = Math.round(lastFocused.left! + lastFocused.width! / 2 - width / 2);
      top = Math.round(lastFocused.top! + lastFocused.height! / 2 - height / 2);
    }
  } catch {
    // Fallback to center
    const { screenX, screenY, outerWidth, outerHeight } = window;

    left = Math.round(screenX + outerWidth / 2 - width / 2);
    top = Math.round(screenY + outerHeight / 2 - height / 2);
  }

  const win = await browser.windows.create({
    type: "popup",
    url: getPublicURL("approve.html"),
    width,
    height,
    top: Math.max(top, 20),
    left: Math.max(left, 20),
  });

  // Firefox currently ignores left/top for create, but it works for update
  if (win.id && win.left !== left && win.state !== "fullscreen") {
    await browser.windows.update(win.id, { left, top });
  }

  return win;
}
