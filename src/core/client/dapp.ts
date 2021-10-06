import { assert } from "lib/system/assert";
import { MessageType } from "core/types";

import { porter } from "./base";

export async function getDAppWalletStatus() {
  const type = MessageType.GetWalletStatus;
  const res = await porter.request({ type });
  assert(res?.type === type);
  return res.status;
}
