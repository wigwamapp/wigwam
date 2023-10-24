import { assert } from "lib/system/assert";
import { getPublicURL } from "lib/ext/utils";

import { Network } from "core/types";

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

export function getTokenLogoUrl(logoUrl?: string) {
  if (logoUrl?.startsWith("{{native}}")) {
    const [, chainTag] = logoUrl.split("/");
    return chainTag
      ? getPublicURL(`icons/nativeToken/${chainTag}.png`)
      : undefined;
  }

  return logoUrl;
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
