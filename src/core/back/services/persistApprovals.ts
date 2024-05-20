import { persistSession, cleanupSession } from "lib/ext/safeSession";

import { APPROVALS_SESSION } from "core/types";

import { approvalsChanged, $approvals } from "../state";

export function startPersistingApprovals() {
  approvalsChanged.watch(async () => {
    const approvals = $approvals.getState();

    if (approvals.length === 0) {
      await cleanupSession(APPROVALS_SESSION);
      return;
    }

    await persistSession(
      APPROVALS_SESSION,
      approvals.map((a) => ({ ...a, rpcCtx: a.rpcCtx?.serialize() })),
    );
  });
}
