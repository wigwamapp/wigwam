import { atomWithURLHash } from "lib/atom-utils";

import { Page, WelcomeStep, AddAccountStep, SettingTabs } from "app/defaults";

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

export const settingTabAtom = atomWithURLHash<SettingTabs>(
  "setting",
  SettingTabs.General
);

export const tokenSlugAtom = atomWithURLHash<string | null>("token", null);
