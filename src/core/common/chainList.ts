import axios from "axios";

import { withOfflineCache } from "lib/ext/offlineCache";

const CHAIN_LIST_ENDPOINT = "https://chainlist.org/rpcs.json";
const CHAIN_ICONS_ENDPOINT = "https://chainid.network/chain_icons.json";

const REFRESH_INTERVAL = 7 * 24 * 60 * 60_000; // 1 week

export const chainListApi = axios.create({
  timeout: 120_000,
});

export const getAllEvmNetworks = withOfflineCache(
  async () => {
    const [chains, icons] = await Promise.all([
      chainListApi.get<ChainListChain[]>(CHAIN_LIST_ENDPOINT),
      // Icons are cosmetic, never fail the whole refresh because of them
      chainListApi
        .get<ChainIcon[]>(CHAIN_ICONS_ENDPOINT)
        .catch(() => ({ data: [] })),
    ]);

    const networks = toEvmNetworks(chains.data, icons.data);

    // Do not cache a broken response for a whole week
    if (networks.length === 0) {
      throw new Error("Chainlist returned no usable networks");
    }

    return networks;
  },
  {
    key: "all_networks",
    hotMaxAge: 5_000,
    coldMaxAge: REFRESH_INTERVAL,
  },
);

export type EvmNetwork = {
  chainId: number;
  name: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];

  // meta
  explorers?: {
    name: string;
    url: string;
    apiUrl?: string;
  }[];
  icon?: {
    url: string;
  };
  infoUrl?: string;
  testnet?: boolean;
  faucets?: string[];
};

/**
 * Raw shape of <https://chainlist.org/rpcs.json>.
 * Community-maintained, so every field is treated as untrusted.
 */
type ChainListChain = {
  chainId?: number;
  name?: string;
  nativeCurrency?: {
    name?: string;
    symbol?: string;
    decimals?: number;
  };
  rpc?: (string | { url?: string; tracking?: string })[];
  explorers?: (string | { name?: string; url?: string; apiUrl?: string })[];
  /** Icon slug, resolved against {@link CHAIN_ICONS_ENDPOINT} */
  icon?: string | { url?: string };
  infoURL?: string;
  isTestnet?: boolean;
  testnet?: boolean;
  faucets?: string[];
};

/** Raw shape of <https://chainid.network/chain_icons.json> */
type ChainIcon = {
  name?: string;
  icons?: { url?: string }[];
};

export function toEvmNetworks(
  rawChains: unknown,
  rawIcons: unknown,
): EvmNetwork[] {
  if (!Array.isArray(rawChains)) return [];

  const icons = toIconMap(rawIcons);
  const byChainId = new Map<number, EvmNetwork>();

  for (const chain of rawChains) {
    const network = toEvmNetwork(chain, icons);
    // First entry wins, chainlist may repeat a chainId
    if (network && !byChainId.has(network.chainId)) {
      byChainId.set(network.chainId, network);
    }
  }

  return Array.from(byChainId.values());
}

function toIconMap(rawIcons: unknown): Map<string, string> {
  const icons = new Map<string, string>();
  if (!Array.isArray(rawIcons)) return icons;

  for (const icon of rawIcons as ChainIcon[]) {
    const name = typeof icon?.name === "string" ? icon.name : "";
    const url = cleanUrl(icon?.icons?.[0]?.url);

    if (name && url && !icons.has(name)) icons.set(name, url);
  }

  return icons;
}

function toEvmNetwork(
  chain: ChainListChain | undefined,
  icons: Map<string, string>,
): EvmNetwork | null {
  const chainId = chain?.chainId;
  if (!chain || typeof chainId !== "number" || !Number.isFinite(chainId)) {
    return null;
  }

  const name = typeof chain.name === "string" ? chain.name.trim() : "";
  if (!name) return null;

  const nativeCurrency = parseNativeCurrency(chain.nativeCurrency);
  if (!nativeCurrency) return null;

  const rpcUrls = parseRpcUrls(chain.rpc);
  // Without an http(s) RPC the network can neither be added nor synced
  if (rpcUrls.length === 0) return null;

  return {
    chainId,
    name,
    nativeCurrency,
    rpcUrls,
    explorers: parseExplorers(chain.explorers),
    icon: parseIcon(chain.icon, icons),
    infoUrl: toHttpUrl(chain.infoURL) ?? undefined,
    testnet: chain.isTestnet ?? chain.testnet ?? false,
    faucets: parseFaucets(chain.faucets),
  };
}

function parseNativeCurrency(
  currency: ChainListChain["nativeCurrency"],
): EvmNetwork["nativeCurrency"] | null {
  const symbol = typeof currency?.symbol === "string" ? currency.symbol : "";
  const decimals = currency?.decimals;

  if (!symbol || typeof decimals !== "number" || !Number.isFinite(decimals)) {
    return null;
  }

  return {
    name: typeof currency?.name === "string" ? currency.name : symbol,
    symbol,
    decimals,
  };
}

function parseRpcUrls(rpc: ChainListChain["rpc"]): string[] {
  if (!Array.isArray(rpc)) return [];

  const urls = new Set<string>();

  for (const entry of rpc) {
    // Drops ws:// and wss:// endpoints, plus malformed values
    // chainlist sometimes carries, e.g. "rpcWorking:false"
    const url = toHttpUrl(typeof entry === "string" ? entry : entry?.url);
    if (url) urls.add(formatUrl(url));
  }

  return Array.from(urls);
}

function parseExplorers(
  explorers: ChainListChain["explorers"],
): EvmNetwork["explorers"] {
  if (!Array.isArray(explorers)) return undefined;

  const parsed = new Map<
    string,
    NonNullable<EvmNetwork["explorers"]>[number]
  >();

  for (const entry of explorers) {
    const isString = typeof entry === "string";

    const url = toHttpUrl(isString ? entry : entry?.url);
    if (!url) continue;

    const apiUrl = isString ? null : toHttpUrl(entry?.apiUrl);

    const formatted = formatUrl(url);
    if (parsed.has(formatted)) continue;

    parsed.set(formatted, {
      name: !isString && typeof entry?.name === "string" ? entry.name : "",
      url: formatted,
      ...(apiUrl ? { apiUrl } : null),
    });
  }

  return parsed.size > 0 ? Array.from(parsed.values()) : undefined;
}

function parseIcon(
  icon: ChainListChain["icon"],
  icons: Map<string, string>,
): EvmNetwork["icon"] {
  if (!icon) return undefined;

  // chainlist exposes an icon slug (e.g. "ethereum"),
  // the actual url lives in a separate endpoint
  const url = typeof icon === "string" ? icons.get(icon) : cleanUrl(icon.url);

  return url && /^(ipfs|https?):\/\//i.test(url) ? { url } : undefined;
}

function parseFaucets(
  faucets: ChainListChain["faucets"],
): string[] | undefined {
  if (!Array.isArray(faucets)) return undefined;

  const parsed = faucets
    .map((faucet) => toHttpUrl(faucet))
    .filter((faucet): faucet is string => Boolean(faucet));

  return parsed.length > 0 ? parsed : undefined;
}

const HTTP_URL_RE = /^https?:\/\//i;
const INVISIBLE_CHARS_RE = /[\u200B-\u200D\uFEFF]/g;

function cleanUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;

  // Some entries carry leading spaces or zero-width characters
  const url = value.replace(INVISIBLE_CHARS_RE, "").trim();

  return url || null;
}

function toHttpUrl(value: unknown): string | null {
  const url = cleanUrl(value);

  return url && HTTP_URL_RE.test(url) ? url : null;
}

function formatUrl(url: string) {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}
