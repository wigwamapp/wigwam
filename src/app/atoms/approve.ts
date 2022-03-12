import { atomWithAutoReset } from "lib/atom-utils";

import { getApprovals, onApprovalsUpdated } from "core/client";

export const approvalsAtom = atomWithAutoReset(getApprovals, {
  onMount: onApprovalsUpdated,
});
