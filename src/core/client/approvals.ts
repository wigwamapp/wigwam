import { assert } from "lib/system/assert";
import {
  EventMessage,
  MessageType,
  Approval,
  ApprovalResult,
} from "core/types";

import { porter } from "./base";

export async function getApprovals() {
  const type = MessageType.GetApprovals;

  const res = await porter.request({ type });
  assert(res?.type === type);

  return res.approvals;
}

export function onApprovalsUpdated(
  callback: (newApprovals: Approval[]) => void,
) {
  return porter.onOneWayMessage<EventMessage>((msg) => {
    if (msg?.type === MessageType.ApprovalsUpdated) {
      callback(msg.approvals);
    }
  });
}

export async function approveItem(approvalId: string, result: ApprovalResult) {
  const type = MessageType.Approve;

  const res = await porter.request(
    { type, approvalId, result },
    { timeout: 3 * 60_000 },
  );
  assert(res?.type === type);
}

export function rejectAllApprovals() {
  porter.sendOneWayMessage({ type: MessageType.RejectAllApprovals });
}
