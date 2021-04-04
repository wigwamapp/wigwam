import { IntercomClient } from "lib/ext/intercom/client";
import { assert } from "lib/system/assert";
import {
  IntercomTarget,
  Request,
  Response,
  EventMessage,
  MessageType,
  WalletStatus,
} from "core/types";

const intercom = new IntercomClient<Request, Response>(IntercomTarget.Wallet);

export async function getWalletStatus() {
  const type = MessageType.GetWalletStatus;
  const res = await intercom.request({ type });
  assert(res?.type === type);
  return res.status;
}

export function onWalletStatusUpdated(
  callback: (newWalletStatus: WalletStatus) => void
) {
  return intercom.onMessage<EventMessage>((msg) => {
    if (msg.type === MessageType.WalletStatusUpdated) {
      callback(msg.status);
    }
  });
}
