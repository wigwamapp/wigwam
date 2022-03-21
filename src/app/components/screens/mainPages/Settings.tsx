import { FC, Suspense, useMemo } from "react";
import { useAtomValue } from "jotai";

import { settingTabAtom } from "app/atoms";
import { SettingTab } from "app/nav";
import SecondaryTabs from "app/components/blocks/SecondaryTabs";

import SettingsTab from "./Settings.Tab";

const Settings: FC = () => {
  const activeTabRoute = useAtomValue(settingTabAtom);
  const activeRoute = useMemo(
    () =>
      tabsContent.find(({ route }) => route.setting === activeTabRoute)?.route,
    [activeTabRoute]
  );

  return (
    <div className="flex mt-5 min-h-0 grow">
      <SecondaryTabs tabs={tabsContent} activeRoute={activeRoute} />

      <Suspense fallback={null}>
        <SettingsTab />
      </Suspense>
    </div>
  );
};

export default Settings;

const tabsContent = [
  {
    route: { page: "settings", setting: SettingTab.General },
    title: "General",
    desc: "Choose which of the wallets belonging to the Secret Phrase you wish to add.",
  },
  {
    route: { page: "settings", setting: SettingTab.Profile },
    title: "Profile",
    desc: "Choose which of the wallets belonging to the Secret Phrase you wish to add.",
  },
  {
    route: { page: "settings", setting: SettingTab.Security },
    title: "Security & Privacy",
    desc: "Choose which of the wallets belonging to the Secret Phrase you wish to add.",
  },
  {
    route: { page: "settings", setting: SettingTab.Web3 },
    title: "Web 3",
    desc: "Choose which of the wallets belonging to the Secret Phrase you wish to add.",
  },
  {
    route: { page: "settings", setting: SettingTab.Networks },
    title: "Networks",
    desc: "Choose which of the wallets belonging to the Secret Phrase you wish to add.",
  },
  {
    route: { page: "settings", setting: SettingTab.Advanced },
    title: "Advanced",
    desc: "Additional features management",
  },
  {
    route: { page: "settings", setting: SettingTab.About },
    title: "About",
    desc: "",
  },
];
