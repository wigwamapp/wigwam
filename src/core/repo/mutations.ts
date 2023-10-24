import { nanoid } from "nanoid";

import { permissions } from "./helpers";

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
