import { assert } from "lib/system/assert";
import { getPublicURL } from "lib/ext/utils";

import { INetwork } from "core/repo";

import { ETHEREUM } from "./ethereum";
import { OPTIMISM } from "./optimism";
import { POLYGON } from "./polygon";
import { BSC } from "./bsc";
import { ARBITRUM } from "./arbitrum";
import { AVALANCE } from "./avalanche";
import { HARMONY } from "./harmony";
import { FANTOM } from "./fantom";
import { CELO } from "./celo";

// Currently taken from
// https://github.com/TP-Lab/networklist-org/blob/main/chains.json
// https://chainid.network/chains.json

export const DEFAULT_NETWORKS: INetwork[] = [
  ETHEREUM,
  OPTIMISM,
  POLYGON,
  BSC,
  ARBITRUM,
  AVALANCE,
  HARMONY,
  FANTOM,
  CELO,
].flat();

if (process.env.STAGING_ENV === "true") {
  assert(
    new Set(DEFAULT_NETWORKS.map((n) => n.chainId)).size ===
      DEFAULT_NETWORKS.length,
    "Duplicate chain id found in DEFAULT_NETWORKS"
  );
}

export const INITIAL_NETWORK = ETHEREUM[0]; // Ethereum Mainnet

export const NETWORK_ICON_MAP = new Map<number, string>(
  DEFAULT_NETWORKS.filter((n) => n.type === "mainnet").map((n) => [
    n.chainId,
    getPublicURL(`icons/network/${n.chainTag}.png`),
  ])
);
