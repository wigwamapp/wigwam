import { assert } from "lib/system/assert";
import { EventMessage, MessageType, Approval } from "core/types";

import { porter } from "./base";

export async function getApprovals() {
  const type = MessageType.GetApprovals;

  const res = await porter.request({ type });
  assert(res?.type === type);

  return res.approvals;
}

export function onApprovalsUpdated(
  callback: (newApprovals: Approval[]) => void
) {
  return porter.onOneWayMessage<EventMessage>((msg) => {
    if (msg?.type === MessageType.ApprovalsUpdated) {
      callback(msg.approvals);
    }
  });
}

export async function approveItem(approvalId: string, approve: boolean) {
  const type = MessageType.Approve;

  const res = await porter.request({ type, approvalId, approve });
  assert(res?.type === type);
}
