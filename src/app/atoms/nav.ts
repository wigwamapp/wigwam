import { atomWithURLHash } from "lib/atom-utils";

import { Page, WalletStep } from "app/defaults";

export const pageAtom = atomWithURLHash("page", Page.Default);

export const welcomeStepAtom = atomWithURLHash(
  "welcome_step",
  WalletStep.ChooseLanguage
);

export const addAccountStepAtom = atomWithURLHash(
  "addacc_step",
  WalletStep.ChooseLanguage
);
