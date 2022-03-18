import { FC, Suspense, useMemo } from "react";
import { match } from "ts-pattern";
import classNames from "clsx";
import { useAtomValue } from "jotai";
import { Redirect } from "lib/navigation";

import { SettingTab } from "app/defaults";
import { settingTabAtom } from "app/atoms";
import PageLayout from "app/components/layouts/PageLayout";
import SettingsTab from "app/components/elements/SettingsTab";
import ScrollAreaContainer from "app/components/elements/ScrollAreaContainer";
import General from "app/components/blocks/settingTabs/General";
import Security from "app/components/blocks/settingTabs/Security";
import Web3 from "app/components/blocks/settingTabs/Web3";
import Networks from "app/components/blocks/settingTabs/Networks";
import Profile from "app/components/blocks/settingTabs/Profile";
import About from "app/components/blocks/settingTabs/About";
import Advanced from "app/components/blocks/settingTabs/Advanced";

const settingsRoutes = (settingTab: SettingTab) => {
  return (
    match(settingTab)
      .with(SettingTab.General, () => <General />)
      .with(SettingTab.Profile, () => <Profile />)
      .with(SettingTab.Security, () => <Security />)
      .with(SettingTab.Web3, () => <Web3 />)
      .with(SettingTab.Networks, () => <Networks />)
      .with(SettingTab.About, () => <About />)
      .with(SettingTab.Advanced, () => <Advanced />)
      // Redirect to default
      .otherwise(() => <Redirect to={{ settingTab: SettingTab.General }} />)
  );
};

const Settings: FC = () => {
  const settingTab = useAtomValue(settingTabAtom);

  return (
    <PageLayout className="flex flex-col">
      <div className="flex mt-5 min-h-0 grow">
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
    route: SettingTab.Advanced,
    title: "Advanced",
    desc: "Additional features management",
  },
  {
    route: SettingTab.About,
    title: "About",
    desc: "",
  },
];

const Tabs: FC = () => (
  <ScrollAreaContainer
    className={classNames(
      "flex flex-col",
      "w-[calc(19.25rem+1px)] pr-6",
      "border-r border-brand-main/[.07]"
    )}
    viewPortClassName="pb-20 rounded-t-[.625rem]"
    scrollBarClassName="py-0 pb-20 !right-1"
  >
    {tabsContent.map(({ title, route, desc }, i) => (
      <SettingsTab
        key={title}
        title={title}
        route={route}
        desc={desc}
        className={classNames(i !== tabsContent.length - 1 && "mb-2")}
      />
    ))}
  </ScrollAreaContainer>
);

export default Settings;
