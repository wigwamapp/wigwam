import { resource, resourceFactory } from "lib/resax";

import {
  getWalletStatus,
  isWalletHasSeedPhrase,
  onWalletStatusUpdated,
  getNeuterExtendedKey,
} from "core/client";

export const walletStatusRes = resource(getWalletStatus, {
  preload: true,
  onMount: (r) =>
    onWalletStatusUpdated((newWalletStatus) => r.put(newWalletStatus)),
});

export const hasSeedPhraseRes = resource(isWalletHasSeedPhrase);

export const neuterExtendedKeyRes = resourceFactory(getNeuterExtendedKey);
