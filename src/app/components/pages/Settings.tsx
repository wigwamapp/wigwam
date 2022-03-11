import { FC, Suspense, useMemo } from "react";
import { match } from "ts-pattern";
import classNames from "clsx";
import { useAtomValue } from "jotai";
import { Redirect } from "lib/navigation";

import PageLayout from "app/components/layouts/PageLayout";
import SettingsTab from "app/components/elements/SettingTab";
import { SettingTab } from "app/defaults";
import { settingTabAtom } from "app/atoms";
import General from "../blocks/settingTabs/General";
import Security from "../blocks/settingTabs/Security";
import Web3 from "../blocks/settingTabs/Web3";
import Networks from "../blocks/settingTabs/Networks";
import Profile from "../blocks/settingTabs/Profile";
import About from "../blocks/settingTabs/About";

const settingsRoutes = (settingTab: SettingTab) => {
  return (
    match(settingTab)
      .with(SettingTab.General, () => <General />)
      .with(SettingTab.Profile, () => <Profile />)
      .with(SettingTab.Security, () => <Security />)
      .with(SettingTab.Web3, () => <Web3 />)
      .with(SettingTab.Networks, () => <Networks />)
      .with(SettingTab.About, () => <About />)
      // Redirect to default
      .otherwise(() => <Redirect to={{ settingTab: SettingTab.General }} />)
  );
};

const Settings: FC = () => {
  const settingTab = useAtomValue(settingTabAtom);

  return (
    <PageLayout className="flex flex-col">
      <div className="flex mt-5 h-full">
        <Tabs />
        <Suspense fallback={null}>
          {useMemo(() => settingsRoutes(settingTab), [settingTab])}
        </Suspense>
      </div>
    </PageLayout>
  );
};

const tabsContent: Array<{ route: SettingTab; title: string; desc: string }> = [
  {
    route: SettingTab.General,
    title: "General",
    desc: "Choose which of the wallets belonging to the Secret Phrase you wish to add.",
  },
  {
    route: SettingTab.Profile,
    title: "Profile",
    desc: "Choose which of the wallets belonging to the Secret Phrase you wish to add.",
  },
  {
    route: SettingTab.Security,
    title: "Security & Privacy",
    desc: "Choose which of the wallets belonging to the Secret Phrase you wish to add.",
  },
  {
    route: SettingTab.Web3,
    title: "Web 3",
    desc: "Choose which of the wallets belonging to the Secret Phrase you wish to add.",
  },
  {
    route: SettingTab.Networks,
    title: "Networks",
    desc: "Choose which of the wallets belonging to the Secret Phrase you wish to add.",
  },
  {
    route: SettingTab.About,
    title: "About",
    desc: "Choose which of the wallets belonging to the Secret Phrase you wish to add.",
  },
];
const Tabs: FC = () => (
  <div
    className={classNames(
      "flex flex-col",
      "w-[333px] pr-6",
      "border-r border-brand-main/[.07]"
    )}
  >
    {tabsContent.map((tab) => (
      <SettingsTab key={tab.title} {...tab} />
    ))}
  </div>
);

export default Settings;
