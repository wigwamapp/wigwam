import { IntercomClient } from "lib/ext/intercom/client";
import { assert } from "lib/system/assert";
import {
  MessageType,
  Request,
  Response,
  EventMessage,
  IComChannel,
} from "core/types";
import * as Storage from "lib/ext/storage";

const intercom = new IntercomClient<Request, Response>(IComChannel.Wallet);

intercom.onMessage<EventMessage>(console.info);

(async () => {
  try {
    const res = await intercom.request({ type: MessageType.GetWalletStatus });
    assert(res?.type === MessageType.GetWalletStatus);
    console.info(res.status);
  } catch (err) {
    console.error(err);
  }
})();

(window as any).Storage = Storage;
