import { storage } from "lib/ext/storage";

import { INITIAL_NETWORK } from "fixtures/networks";
import { CHAIN_ID } from "core/types";
import * as repo from "core/repo";

const INFURA_TEMPLATE = "${INFURA_API_KEY}";
const INFURA_API_KEY = process.env.VIGVAM_INFURA_API_KEY;

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

  if (process.env.NODE_ENV !== "test" && url.includes(INFURA_TEMPLATE)) {
    if (!INFURA_API_KEY) {
      throw new Error(
        "Current rpc url requires INFURA API KEY environment variable",
      );
    }

    url = url.replace(INFURA_TEMPLATE, INFURA_API_KEY);
  }

  // Avoid double subscription on first load (rare case)
  if (!rpcUrlsCache.has(chainId)) {
    rpcUrlsCache.set(chainId, url);

    const unsub = storage.subscribe(savedKey, () => {
      rpcUrlsCache.delete(chainId);
      unsub();
    });
  }

  return url;
}

export function setRpcUrl(chainId: number, url: string | null) {
  const key = getRpcUrlKey(chainId);
  return url ? storage.put(key, url) : storage.remove(key);
}

export async function cleanupNetwork(chainId: number) {
  await storage.put(CHAIN_ID, INITIAL_NETWORK.chainId);
  await repo.networks.delete(chainId);
  await setRpcUrl(chainId, null);
  rpcUrlsCache.delete(chainId);
}

export async function getNetwork(chainId: number) {
  const net = await repo.networks.get(chainId);
  if (!net) throw new NetworkNotFoundError();
  return net;
}

export function mergeNetworkUrls(base?: string[], toMerge?: string[]) {
  if (base && toMerge) {
    return Array.from(new Set([...toMerge, ...base].map(formatRpcUrl)));
  }

  return base ?? toMerge ?? [];
}

export function formatRpcUrl(url: string) {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

export class NetworkNotFoundError extends Error {
  name = "NetworkNotFoundError";
  message = "Network Not Found";
}

export function getRpcUrlKey(chainId: number) {
  return `rpc_url_${chainId}`;
}
