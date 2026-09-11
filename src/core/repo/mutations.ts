import { nanoid } from "nanoid";

import { permissions, trustedDapps } from "./helpers";

/** Asked once per site, then never again */
export async function trustDapp(origin: string) {
  await trustedDapps.put({ origin, timeAt: Date.now() });
}

export async function createOrUpdateNetworkPermission(
  origin: string,
  chainId: number,
) {
  if (await permissions.get(origin)) {
    await permissions.where({ origin }).modify((perm) => {
      perm.chainId = chainId;
    });
  } else {
    await permissions.put({
      id: nanoid(),
      origin,
      chainId,
      accountAddresses: [],
      timeAt: Date.now(),
    });
  }
}
