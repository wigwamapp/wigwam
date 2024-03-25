import { FC, Suspense, useMemo } from "react";
import { useAtomValue } from "jotai";
import { match } from "ts-pattern";
import { Redirect } from "lib/navigation";

import { Page, SettingTab } from "app/nav";
import { settingTabAtom } from "app/atoms";

import General from "../settingTabs/General";
import Security from "../settingTabs/Security";
import Web3 from "../settingTabs/Web3";
import Networks from "../settingTabs/Networks";
import Profile from "../settingTabs/Profile";
import About from "../settingTabs/About";

function matchSettingTab(settingTab: SettingTab) {
  return (
    match(settingTab)
      .with(SettingTab.General, () => <General />)
      .with(SettingTab.Profile, () => <Profile />)
      .with(SettingTab.Security, () => <Security />)
      .with(SettingTab.Web3, () => <Web3 />)
      .with(SettingTab.Networks, () => <Networks />)
      .with(SettingTab.About, () => <About />)
      // Redirect to default
      .otherwise(() => (
        <Redirect to={{ page: Page.Settings, setting: SettingTab.General }} />
      ))
  );
}

const SettingsTab: FC = () => {
  const settingTab = useAtomValue(settingTabAtom);

  return useMemo(
    () => <Suspense fallback={null}>{matchSettingTab(settingTab)}</Suspense>,
    [settingTab],
  );
};

export default SettingsTab;
