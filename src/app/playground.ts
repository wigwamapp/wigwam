import { PorterClient } from "lib/ext/porter/client";
import { assert } from "lib/system/assert";
import {
  MessageType,
  Request,
  Response,
  EventMessage,
  PorterChannel,
} from "core/types";
import * as Storage from "lib/ext/storage";

const porter = new PorterClient<Request, Response>(PorterChannel.Wallet);

porter.onMessage<EventMessage>(console.info);

(async () => {
  try {
    const res = await porter.request({ type: MessageType.GetWalletStatus });
    assert(res?.type === MessageType.GetWalletStatus);
    console.info(res.status);
  } catch (err) {
    console.error(err);
  }
})();

(window as any).Storage = Storage;
