import { atomWithURLHash } from "lib/atom-utils";

import {
  Page,
  WelcomeStep,
  AddAccountStep,
  SettingTab,
  TransferTab,
  ReceiveTab,
} from "app/nav";

export const pageAtom = atomWithURLHash("page", Page.Default);

export const welcomeStepAtom = atomWithURLHash(
  "welcomeStep",
  WelcomeStep.Hello
);

export const addAccountModalAtom = atomWithURLHash("addAccOpened", false);

export const addAccountStepAtom = atomWithURLHash(
  "addAccStep",
  AddAccountStep.ChooseWay
);

export const settingTabAtom = atomWithURLHash<SettingTab>(
  "setting",
  SettingTab.General
);

export const transferTabAtom = atomWithURLHash<TransferTab>(
  "transfer",
  TransferTab.Asset
);

export const receiveTabAtom = atomWithURLHash<ReceiveTab>(
  "receive",
  ReceiveTab.ShareAddress
);

export const tokenSlugAtom = atomWithURLHash<string | null>("token", null);
