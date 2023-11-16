import { assert } from "lib/system/assert";
import { getPublicURL } from "lib/ext/utils";
import { getERC20IconUrl } from "lib/wigwam-static";

import { Network, Asset } from "core/types";
import { parseTokenSlug } from "core/common/tokens";

import { ETHEREUM } from "./ethereum";
import { OPTIMISM } from "./optimism";
import { POLYGON } from "./polygon";
import { BSC } from "./bsc";
import { ARBITRUM } from "./arbitrum";
import { AVALANCHE } from "./avalanche";
import { HARMONY } from "./harmony";
import { FANTOM } from "./fantom";
import { AURORA } from "./aurora";
import { CELO } from "./celo";
import { HECO } from "./heco";
import { CRONOS } from "./cronos";
import { MOONBEAM } from "./moonbeam";
import { MOONRIVER } from "./moonriver";
import { EVMOS } from "./evmos";
import { SYSCOIN } from "./syscoin";
import { BOBA } from "./boba";
import { LOCAL } from "./local";
import { ZKSYNCERA } from "./zksyncera";
import { ARBITRUMNOVA } from "./arbitrumnova";

// Currently taken from
// https://github.com/TP-Lab/networklist-org/blob/main/chains.json
// https://chainid.network/chains.json

export const DEFAULT_NETWORKS: Network[] = [
  ETHEREUM,
  AVALANCHE,
  BSC,
  POLYGON,
  FANTOM,
  OPTIMISM,
  ARBITRUM,
  AURORA,
  HARMONY,
  CRONOS,
  ZKSYNCERA,
  ARBITRUMNOVA,
  MOONBEAM,
  MOONRIVER,
  EVMOS,
  HECO,
  CELO,
  SYSCOIN,
  BOBA,
  LOCAL,
].flatMap((chainNets, i) =>
  chainNets.map((n) => ({
    ...n,
    position: i,
  })),
);

export const DEFAULT_CHAIN_IDS = new Set(
  DEFAULT_NETWORKS.map((n) => n.chainId),
);

export const MAINNET_CHAIN_IDS = new Set(
  DEFAULT_NETWORKS.filter((n) => n.type === "mainnet").map((n) => n.chainId),
);

if (process.env.RELEASE_ENV === "false") {
  assert(
    new Set(DEFAULT_NETWORKS.map((n) => n.chainId)).size ===
      DEFAULT_NETWORKS.length,
    "Duplicate chain id found in DEFAULT_NETWORKS",
  );
}

export const INITIAL_NETWORK = ETHEREUM[0]; // Ethereum Mainnet

export const NETWORK_ICON_MAP = new Map<number, string>(
  DEFAULT_NETWORKS.map((n) => [
    n.chainId,
    getPublicURL(
      `icons/network/${n.chainTag}${
        n.type === "mainnet" ? "" : "-testnet"
      }.png`,
    ),
  ]),
);

export function getNetworkIconUrl(network: Network) {
  return (
    NETWORK_ICON_MAP.get(network.chainId) ??
    network.iconUrls?.[0] ??
    getPublicURL(`icons/network/unknown.png`)
  );
}

export function getAssetLogoUrl(asset: Asset) {
  const { address } = parseTokenSlug(asset.tokenSlug);

  if (asset.logoUrl?.startsWith("{{native}}")) {
    const [, chainTag] = asset.logoUrl.split("/");
    return chainTag
      ? getPublicURL(`icons/nativeToken/${chainTag}.png`)
      : undefined;
  }

  return MAINNET_CHAIN_IDS.has(asset.chainId)
    ? getERC20IconUrl(asset.chainId, address.toLowerCase())
    : asset.logoUrl;
}

export const COINGECKO_NATIVE_TOKEN_IDS = new Map([
  [1, "ethereum"],
  [43114, "avalanche-2"],
  [56, "binancecoin"],
  [137, "matic-network"],
  [250, "fantom"],
  [10, "ethereum"],
  [42161, "ethereum"],
  [1313161554, "ethereum"],
  [1666600000, "harmony"],
  [128, "huobi-token"],
  [42220, "celo"],
  [288, "boba-network"],
  [25, "crypto-com-chain"],
  [9001, "evmos"],
  [1284, "moonbeam"],
  [1285, "moonriver"],
  [57, "syscoin"],
  [324, "ethereum"],
  [42170, "ethereum"],
]);

export const U_INDEXER_CHAINS = new Map([
  [1, "ethereum"],
  [56, "bsc"],
  [137, "matic"],
  [42220, "celo"],
  [8217, "klaytn"],
  [25, "cronos"],
  [106, "velas"],
  [42161, "arbitrum"],
  [43114, "avalanche"],
  [50, "xinfin"],
  [32769, "zilliqa"],
  [250, "fantom"],
  [122, "fuse"],
  [1313161554, "aurora"],
  [1088, "metis"],
  [5000, "mantle"],
  [1101, "zkevm"],
  [1284, "moonbeam"],
  [10, "optimism"],
  [8453, "base"],
]);
