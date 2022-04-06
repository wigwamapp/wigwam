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

// Currently taken from
// https://github.com/TP-Lab/networklist-org/blob/main/chains.json
// https://chainid.network/chains.json

export const DEFAULT_NETWORKS: Network[] = [
  ETHEREUM,
  OPTIMISM,
  POLYGON,
  BSC,
  ARBITRUM,
  AVALANCHE,
  HARMONY,
  FANTOM,
  AURORA,
  CELO,
  HECO,
].flat();

if (process.env.RELEASE_ENV === "false") {
  assert(
    new Set(DEFAULT_NETWORKS.map((n) => n.chainId)).size ===
      DEFAULT_NETWORKS.length,
    "Duplicate chain id found in DEFAULT_NETWORKS"
  );
}

export const INITIAL_NETWORK = ETHEREUM[0]; // Ethereum Mainnet

export const NETWORK_ICON_MAP = new Map<number, string>(
  DEFAULT_NETWORKS.map((n) => [
    n.chainId,
    getPublicURL(
      `icons/network/${n.chainTag}${n.type === "mainnet" ? "" : "-testnet"}.png`
    ),
  ])
);

export function getTokenLogoUrl(logoUrl?: string) {
  if (logoUrl?.startsWith("{{native}}")) {
    const [, chainTag] = logoUrl.split("/");
    return getPublicURL(`icons/nativeToken/${chainTag}.png`);
  }

  return logoUrl;
}
