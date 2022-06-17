import browser, { Windows } from "webextension-polyfill";
import memoizeOne from "memoize-one";
import { getPublicURL, openOrFocusMainTab } from "lib/ext/utils";
import { createQueue } from "lib/system/queue";

import { Approval } from "core/types";

import { $approvals, approvalAdded } from "../state";

type ApprovePopupState = {
  type: "window" | "tab";
  id: number;
} | null;

const APPROVE_WINDOW_URL = getPublicURL("approve.html");
const WINDOW_POSITION =
  process.env.NODE_ENV === "development" ? "center" : "top-right";

const enqueueOpenApprove = createQueue();

export function startApproveWindowOpener() {
  let popupState: ApprovePopupState = null;

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

  $approvals.watch((approvals) => {
    if (approvals.length === 0) {
      if (popupState?.type === "window") {
        browser.windows.remove(popupState.id).catch(console.error);
      } else if (popupState?.type === "tab") {
        browser.tabs.remove(popupState.id).catch(console.error);
      }
    } else {
      focusApprovalTab(approvals[0]);
    }
  });

  const openApproveWindow = () =>
    enqueueOpenApprove(async () => {
      if ($approvals.getState().length === 0) return;

      try {
        if (popupState?.type === "window") {
          await browser.windows
            .update(popupState.id, { focused: true })
            .catch(console.error);
        } else if (popupState?.type === "tab") {
          await browser.tabs
            .update(popupState.id, { active: true })
            .catch(console.error);
        } else {
          await browser.tabs
            .query({ url: APPROVE_WINDOW_URL })
            .then((restApproveTabs) =>
              restApproveTabs.length > 0
                ? browser.tabs.remove(restApproveTabs.map(({ id }) => id!))
                : null
            )
            .catch(console.error);

          popupState = await createApproveWindow(WINDOW_POSITION);
        }
      } catch (err) {
        console.error(err);
      }
    });

  const focusApprovalTab = (currentApproval: Approval) => {
    if (popupState?.type === "tab") return;

    if (currentApproval.source.type === "page") {
      if (currentApproval.source.tabId) {
        browser.tabs
          .update(currentApproval.source.tabId, { active: true })
          .catch(console.error);
      }
    } else {
      openOrFocusMainTab();
    }
  };

  browser.windows.onRemoved.addListener((winId) => {
    if (popupState?.type === "window" && winId === popupState.id) {
      popupState = null;
    }
  });

  browser.tabs.onRemoved.addListener((tabId) => {
    if (popupState?.type === "tab" && tabId === popupState.id) {
      popupState = null;
    }
  });
}

async function createApproveWindow(position: "center" | "top-right") {
  const width = 440;
  const height = 660;

  let lastFocused: Windows.Window | undefined;
  let left = 0;
  let top = 0;
  try {
    lastFocused = await browser.windows.getLastFocused();

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

  if (lastFocused?.state === "fullscreen" && (await isMacOs())) {
    const tab = await browser.tabs.create({
      url: getPublicURL("approve.html"),
      active: true,
    });
    return { type: "tab" as const, id: tab.id! };
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

  return { type: "window" as const, id: win.id! };
}

const isMacOs = memoizeOne(() =>
  browser.runtime.getPlatformInfo().then((platform) => platform.os === "mac")
);
