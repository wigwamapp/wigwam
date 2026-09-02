import { atomWithStorage } from "lib/atom-utils";

import { KNOWN_DAPPS } from "core/types";
import { KnownDapps } from "core/common/knownDapps";

/**
 * The DefiLlama directory the background keeps fresh. Null until the first
 * refresh lands, which readers must treat as "no data", never as "unknown
 * dapp".
 */
export const knownDappsAtom = atomWithStorage<KnownDapps | null>(
  KNOWN_DAPPS,
  null,
);
