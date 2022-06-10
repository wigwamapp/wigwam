import { selectAtom } from "jotai/utils";
import { atomWithAutoReset } from "lib/atom-utils";

import { getApprovals, onApprovalsUpdated } from "core/client";

export const approvalsAtom = atomWithAutoReset(getApprovals, {
  onMount: onApprovalsUpdated,
});

export const approvalStatus = selectAtom(approvalsAtom, (approvals) => {
  const actionMap = new Map<
    string,
    { type: "page" | "self"; name?: string; icon?: string }
  >();

  for (const { source } of approvals) {
    const actionId =
      source.type === "page"
        ? `page_${new URL(source.url).origin}`
        : `self_${source.kind}`;

    if (actionMap.has(actionId)) continue;

    actionMap.set(actionId, {
      type: source.type,
      name: source.type === "page" ? new URL(source.url).origin : undefined,
      icon: source.type === "page" ? source.favIconUrl : undefined,
    });

    if (actionMap.size === 3) break;
  }

  return {
    total: approvals.length,
    previewActions: Array.from(actionMap.values()),
  };
});
