import retry from "async-retry";
import BigNumber from "bignumber.js";
import { storage } from "lib/ext/storage";
import { assert } from "lib/system/assert";

import { INITIAL_NETWORK } from "fixtures/networks";
import { AddEthereumChainParameter, CHAIN_ID, Network } from "core/types";
import * as repo from "core/repo";

import { EvmNetwork } from "./chainList";
import { Setting } from "./settings";

const INFURA_TEMPLATE = "${INFURA_API_KEY}";
const INFURA_API_KEY = process.env.WIGWAM_INFURA_API_KEY;

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

export async function setupNewNetwork(
  params: AddEthereumChainParameter,
  evmNet?: EvmNetwork,
) {
  await validateRpc(params).catch(() => {
    throw new Error(
      "RPC validation failed. Check network params or network connection.",
    );
  });

  const chainId = parseInt(params.chainId);

  const networkExists = await repo.networks.get(chainId);

  if (!networkExists) {
    let toAdd: Network = {
      chainId,
      name: params.chainName,
      type: "unknown",
      chainTag: "",
      nativeCurrency: params.nativeCurrency,
      rpcUrls: params.rpcUrls,
      explorerUrls: params.blockExplorerUrls ?? undefined,
      iconUrls: params.iconUrls ?? undefined,
      position: 0,
    };

    if (evmNet) {
      toAdd = {
        ...toAdd,
        type: evmNet.testnet ? "testnet" : toAdd.type,
        explorerUrls: evmNet.explorers?.map((exp) => exp.url),
        explorerApiUrl: evmNet.explorers?.find((exp) => exp.apiUrl)?.apiUrl,
        faucetUrls: evmNet.faucets,
        infoUrl: evmNet.infoUrl,
      };
    }

    // Only http
    toAdd.rpcUrls = toAdd.rpcUrls.filter((url) => url.startsWith("http"));

    await storage.put(Setting.TestNetworks, true);
    await repo.networks.add(toAdd);
  }
}

export function isNetworkWithEthToken(net: Network) {
  return (
    net.type !== "testnet" &&
    net.nativeCurrency.symbol === "ETH" &&
    ["testnet", "taiko"].every((item) => !net.name.toLowerCase().includes(item))
  );
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

async function validateRpc(params: AddEthereumChainParameter) {
  const rpcUrl = params.rpcUrls[0];
  const rpcResponse = await retry(
    async () => {
      const res = await fetch(rpcUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: 1,
          jsonrpc: "2.0",
          method: "eth_chainId",
          params: [],
        }),
      });

      if (res.ok) return res.json();
      throw new Error(res.statusText);
    },
    { retries: 1 },
  );

  const { id, jsonrpc, result } = rpcResponse;
  assert(id === 1);
  assert(jsonrpc === "2.0");
  assert(parseInt(result) === parseInt(params.chainId));
}

export function compareNetworks(a: Network, b: Network) {
  if (a.balanceUSD && b.balanceUSD) {
    return new BigNumber(a.balanceUSD).isGreaterThan(b.balanceUSD) ? -1 : 1;
  } else if (a.balanceUSD && !b.balanceUSD) {
    return -1;
  } else if (b.balanceUSD && !a.balanceUSD) {
    return 1;
  } else {
    return 0;
  }
}
