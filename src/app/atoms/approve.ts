import { selectAtom, unwrap } from "jotai/utils";
import { atomWithAutoReset } from "lib/atom-utils";

import { getApprovals, onApprovalsUpdated } from "core/client";
import { SelfActivityKind } from "core/types";

export const approvalsAtom = atomWithAutoReset(getApprovals, {
  onMount: onApprovalsUpdated,
});

export const approvalStatusAtom = selectAtom(
  unwrap(approvalsAtom, (prev) => prev ?? []),
  (approvals) => {
    const actionMap = new Map<
      string,
      {
        type: "page" | "self";
        kind?: SelfActivityKind;
        name?: string;
        icon?: string;
      }
    >();

    for (const { source } of approvals) {
      const actionId =
        source.type === "page"
          ? `page_${new URL(source.url).origin}`
          : `self_${source.kind}`;

      if (actionMap.has(actionId)) continue;

      actionMap.set(actionId, {
        type: source.type,
        kind: source.type === "self" ? source.kind : undefined,
        name: source.type === "page" ? new URL(source.url).origin : undefined,
        icon: source.type === "page" ? source.favIconUrl : undefined,
      });

      if (actionMap.size === 3) break;
    }

    return {
      total: approvals.length,
      previewActions: Array.from(actionMap.values()),
    };
  },
);
