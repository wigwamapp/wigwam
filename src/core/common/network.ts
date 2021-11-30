import * as Global from "lib/ext/global";
import { assert } from "lib/system/assert";

import * as Repo from "core/repo";

const rpcUrlsCache = new Map<number, string>();

export async function getRpcUrl(chainId: number) {
  let url: string | null | undefined;

  url = rpcUrlsCache.get(chainId);
  if (url) return url;

  const savedKey = getRpcUrlKey(chainId);
  url = Global.get<string>(savedKey);

  if (!url) {
    const network = await getNetwork(chainId);
    url = network.rpcUrls[0];
  }

  // Avoid double subscription on first load (rare case)
  if (!rpcUrlsCache.has(chainId)) {
    rpcUrlsCache.set(chainId, url);
    Global.subscribe(
      savedKey,
      () => {
        rpcUrlsCache.delete(chainId);
      },
      { once: true }
    );
  }

  return url;
}

export function setRpcUrl(chainId: number, url: string) {
  Global.put(getRpcUrlKey(chainId), url);
}

export async function getNetwork(chainId: number) {
  const net = await Repo.networks.get(chainId);
  assert(net, undefined, NetworkNotFoundError);
  return net;
}

export function formatRpcUrl(url: string) {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

export class NetworkNotFoundError implements Error {
  name = "NetworkNotFoundError";
  message = "Network Not Found";
}

function getRpcUrlKey(chainId: number) {
  return `rpc_url_${chainId}`;
}
