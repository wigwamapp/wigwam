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
import { HECO } from "./heco";
import { CRONOS } from "./cronos";
import { MOONBEAM } from "./moonbeam";
import { MOONRIVER } from "./moonriver";
import { EVMOS } from "./evmos";
import { LOCAL } from "./local";
import { ZKSYNCERA } from "./zksyncera";
import { ARBITRUMNOVA } from "./arbitrumnova";
import { BASE } from "./base";
import { SCROLL } from "./scroll";
import { LINEA } from "./linea";
import { CELO } from "./celo";
import { GNOSIS } from "./gnosis";
import { MANTLE } from "./mantle";
import { ROOTSTOCK } from "./rootstock";
import { MODE } from "./mode";
import { BLAST } from "./blast";

// Currently taken from
// https://github.com/TP-Lab/networklist-org/blob/main/chains.json
// https://chainid.network/chains.json

export const DEFAULT_NETWORKS: Network[] = [
  ETHEREUM,
  POLYGON,
  BSC,
  OPTIMISM,
  ARBITRUM,
  AVALANCHE,
  ZKSYNCERA,
  GNOSIS,
  BASE,
  CRONOS,
  FANTOM,
  MANTLE,
  CELO,
  LINEA,
  SCROLL,
  BLAST,
  ROOTSTOCK,
  MODE,
  MOONBEAM,
  AURORA,
  MOONRIVER,
  ARBITRUMNOVA,
  EVMOS,
  HECO,
  HARMONY,
  LOCAL,
].flatMap((chainNets, i) =>
  chainNets.map((n) => ({
    ...n,
    position: i,
  })),
);

const ADDITIONAL_NETWORK_ICONS = [
  {
    chainId: 88,
    chainTag: "viction",
    type: "mainnet",
  },
];

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
  [...DEFAULT_NETWORKS, ...ADDITIONAL_NETWORK_ICONS].map((n) => [
    n.chainId,
    getPublicURL(
      `icons/network/${n.chainTag}${
        n.type === "mainnet" ? "" : "-testnet"
      }.png`,
    ),
  ]),
);

export function getNetworkIconUrl(network: Network) {
  return NETWORK_ICON_MAP.get(network.chainId) ?? network.iconUrls?.[0];
}

export function getAssetLogoUrls(
  asset: Pick<Asset, "chainId" | "tokenSlug" | "logoUrl">,
) {
  const { address } = parseTokenSlug(asset.tokenSlug);

  const urls = [];

  if (asset.logoUrl?.startsWith("{{native}}")) {
    const [, chainTag] = asset.logoUrl.split("/");

    if (chainTag) {
      urls.push(getPublicURL(`icons/nativeToken/${chainTag}.png`));
    }
  } else {
    if (MAINNET_CHAIN_IDS.has(asset.chainId)) {
      const erc20Url = getERC20IconUrl(asset.chainId, address.toLowerCase());
      if (erc20Url) urls.push(erc20Url);
    }

    if (asset.logoUrl) {
      urls.push(asset.logoUrl);
    }
  }

  return urls;
}
