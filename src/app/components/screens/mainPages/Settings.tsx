import { FC, useMemo } from "react";
import { useAtomValue } from "jotai";

import { settingTabAtom } from "app/atoms";
import { SettingTab as SettingTabEnum } from "app/nav";
import SecondaryTabs from "app/components/blocks/SecondaryTabs";

import SettingsTab from "./Settings.Tab";
import ScrollAreaContainer from "../../elements/ScrollAreaContainer";

const Settings: FC = () => {
  const activeTabRoute = useAtomValue(settingTabAtom);

  const activeRoute = useMemo(
    () =>
      tabsContent.find(({ route }) => route.setting === activeTabRoute)?.route,
    [activeTabRoute]
  );

  return (
    <div className="flex min-h-0 grow">
      <SecondaryTabs tabs={tabsContent} activeRoute={activeRoute} />

      {activeTabRoute !== SettingTabEnum.Networks ? (
        <ScrollAreaContainer
          className="box-content w-full px-6"
          viewPortClassName="pb-20 pt-5"
          scrollBarClassName="py-0 pt-5 pb-20"
        >
          <SettingsTab />
        </ScrollAreaContainer>
      ) : (
        <SettingsTab />
      )}
    </div>
  );
};

export default Settings;

const tabsContent = [
  {
    route: { page: "settings", setting: SettingTabEnum.General },
    title: "General",
    desc: "Choose which of the wallets belonging to the Secret Phrase you wish to add.",
  },
  {
    route: { page: "settings", setting: SettingTabEnum.Profile },
    title: "Profile",
    desc: "Choose which of the wallets belonging to the Secret Phrase you wish to add.",
  },
  {
    route: { page: "settings", setting: SettingTabEnum.Security },
    title: "Security & Privacy",
    desc: "Choose which of the wallets belonging to the Secret Phrase you wish to add.",
  },
  {
    route: { page: "settings", setting: SettingTabEnum.Web3 },
    title: "Web 3",
    desc: "Choose which of the wallets belonging to the Secret Phrase you wish to add.",
  },
  {
    route: { page: "settings", setting: SettingTabEnum.Networks },
    title: "Networks",
    desc: "Choose which of the wallets belonging to the Secret Phrase you wish to add.",
  },
  {
    route: { page: "settings", setting: SettingTabEnum.Advanced },
    title: "Advanced",
    desc: "Additional features management",
  },
  {
    route: { page: "settings", setting: SettingTabEnum.About },
    title: "About",
    desc: "",
  },
];
