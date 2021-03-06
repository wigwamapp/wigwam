import { IntercomClient } from "lib/ext/intercom/client";
import { assert } from "lib/system/assert";
import { MessageType, Request, Response } from "core/types";

const intercom = new IntercomClient<Request, Response>("UI");

(async () => {
  try {
    const res = await intercom.request({ type: MessageType.GetWalletStatus });
    assert(res?.type === MessageType.GetWalletStatus);
    console.info(res.status);
  } catch (err) {
    console.error(err);
  }
})();
