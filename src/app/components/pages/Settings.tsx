import { FC, useMemo } from "react";
import { match } from "ts-pattern";
import classNames from "clsx";
import { useAtomValue } from "jotai";
import { Redirect } from "lib/navigation";

import PageLayout from "app/components/layouts/PageLayout";
import SettingTab from "app/components/elements/SettingTab";
import { SettingTabs } from "app/defaults";
import { settingTabAtom } from "app/atoms";
import General from "../blocks/settingTabs/General";
import Network from "../blocks/settingTabs/Network";
import Security from "../blocks/settingTabs/Security";
import Web3 from "../blocks/settingTabs/Web3";
import About from "../blocks/settingTabs/About";
import Profile from "../blocks/settingTabs/Profile";

const settingsRoutes = (settingTab: SettingTabs) => {
  return (
    match({ settingTab })
      .with({ settingTab: SettingTabs.General }, () => <General />)
      .with({ settingTab: SettingTabs.Profile }, () => <Profile />)
      .with({ settingTab: SettingTabs.Security }, () => <Security />)
      .with({ settingTab: SettingTabs.Web3 }, () => <Web3 />)
      .with({ settingTab: SettingTabs.Networks }, () => <Network />)
      .with({ settingTab: SettingTabs.About }, () => <About />)
      // Redirect to default
      .otherwise(() => <Redirect to={{ settingTab: SettingTabs.General }} />)
  );
};

const Settings: FC = () => {
  const settingTab = useAtomValue(settingTabAtom);

  return (
    <PageLayout className="flex flex-col">
      <div className="flex mt-5 h-full">
        <Tabs />
        {useMemo(() => settingsRoutes(settingTab), [settingTab])}
      </div>
    </PageLayout>
  );
};

const tabsContent: Array<{ route: SettingTabs; title: string; desc: string }> =
  [
    {
      route: SettingTabs.General,
      title: "General",
      desc: "Choose which of the wallets belonging to the Secret Phrase you wish to add.",
    },
    {
      route: SettingTabs.Profile,
      title: "Profile",
      desc: "Choose which of the wallets belonging to the Secret Phrase you wish to add.",
    },
    {
      route: SettingTabs.Security,
      title: "Security & Privacy",
      desc: "Choose which of the wallets belonging to the Secret Phrase you wish to add.",
    },
    {
      route: SettingTabs.Web3,
      title: "Web 3",
      desc: "Choose which of the wallets belonging to the Secret Phrase you wish to add.",
    },
    {
      route: SettingTabs.Networks,
      title: "Networks",
      desc: "Choose which of the wallets belonging to the Secret Phrase you wish to add.",
    },
    {
      route: SettingTabs.About,
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
      <SettingTab key={tab.title} {...tab} />
    ))}
  </div>
);

export default Settings;
