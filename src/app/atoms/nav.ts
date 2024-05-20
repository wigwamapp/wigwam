import { atomWithURLHash, atomWithStorage } from "lib/atom-utils";

import {
  Page,
  AddAccountStep,
  SettingTab,
  TransferTab,
  ReceiveTab,
  PopupToolbarTab,
} from "app/nav";

export const pageAtom = atomWithURLHash("page", Page.Default);

export const popupToolbarTabAtom = atomWithStorage<PopupToolbarTab>(
  "popup_toolbar_tab",
  PopupToolbarTab.Assets,
);

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
  ReceiveTab.BuyWithFiat,
);

export const onRampModalAtom = atomWithURLHash("onRampOpened", false);

export const tokenSlugAtom = atomWithURLHash<string | null>("token", null);

export const activityModalAtom = atomWithURLHash("activityOpened", false);

export const chainIdUrlAtom = atomWithURLHash<number | null>("chainid", null);

export const receiveModalAtom = atomWithURLHash("receiveOpened", false);
export const receiveTokenAtom = atomWithURLHash<string | null>(
  "receiveToken",
  null,
);
