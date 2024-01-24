import { atomWithURLHash } from "lib/atom-utils";

import {
  Page,
  AddAccountStep,
  SettingTab,
  TransferTab,
  ReceiveTab,
} from "app/nav";

export const pageAtom = atomWithURLHash("page", Page.Default);

export const addAccountModalAtom = atomWithURLHash("addAccOpened", false);

export const addAccountStepAtom = atomWithURLHash(
  "addAccStepNext",
  AddAccountStep.AddAccountInitial,
);

export const settingTabAtom = atomWithURLHash<SettingTab>(
  "setting",
  SettingTab.General,
);

export const transferTabAtom = atomWithURLHash<TransferTab>(
  "transfer",
  TransferTab.Asset,
);

export const receiveTabAtom = atomWithURLHash<ReceiveTab>(
  "receive",
  ReceiveTab.ShareAddress,
);

export const onRampModalAtom = atomWithURLHash("onRampOpened", false);

export const tokenSlugAtom = atomWithURLHash<string | null>("token", null);

export const activityModalAtom = atomWithURLHash("activityOpened", false);
