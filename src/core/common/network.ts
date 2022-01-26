import { storage } from "lib/ext/storage";
import { assert } from "lib/system/assert";

import * as Repo from "core/repo";

const rpcUrlsCache = new Map<number, string>();

export async function getRpcUrl(chainId: number) {
  let url: string | undefined;

  url = rpcUrlsCache.get(chainId);
  if (url) return url;

  const savedKey = getRpcUrlKey(chainId);
  url = await storage.fetchForce(savedKey);

  if (!url) {
    const network = await getNetwork(chainId);
    url = network.rpcUrls[0];
  }

  // Avoid double subscription on first load (rare case)
  if (!rpcUrlsCache.has(chainId)) {
    rpcUrlsCache.set(chainId, url);

    const unsub = storage.subscribe(savedKey, ({ newValue }) => {
      if (newValue) {
        rpcUrlsCache.set(chainId, newValue);
      } else {
        rpcUrlsCache.delete(chainId);
        unsub();
      }
    });
  }

  return url;
}

export async function setRpcUrl(chainId: number, url: string) {
  await storage.put(getRpcUrlKey(chainId), url);
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
