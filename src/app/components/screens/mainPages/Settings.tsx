import { FC, useMemo } from "react";
import { useAtomValue } from "jotai";

import { settingTabAtom } from "app/atoms";
import { SettingTab } from "app/nav";
import SecondaryTabs from "app/components/blocks/SecondaryTabs";
import ScrollAreaContainer from "app/components/elements/ScrollAreaContainer";
import { ReactComponent as GeneralIcon } from "app/icons/setting-general.svg";
import { ReactComponent as ProfileIcon } from "app/icons/setting-profile.svg";
import { ReactComponent as SecurityIcon } from "app/icons/setting-security.svg";
import { ReactComponent as WebIcon } from "app/icons/setting-web3.svg";
import { ReactComponent as NetworkIcon } from "app/icons/setting-network.svg";
import { ReactComponent as AdvancedIcon } from "app/icons/setting-advanced.svg";
import { ReactComponent as AboutIcon } from "app/icons/setting-about.svg";

import SettingsTab from "./Settings.Tab";

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

      {activeTabRoute !== SettingTab.Networks ? (
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
    route: { page: "settings", setting: SettingTab.General },
    Icon: GeneralIcon,
    title: "General",
    desc: "Choose which of the wallets belonging to the Secret Phrase you wish to add.",
  },
  {
    route: { page: "settings", setting: SettingTab.Profile },
    Icon: ProfileIcon,
    title: "Profile",
    desc: "Choose which of the wallets belonging to the Secret Phrase you wish to add.",
  },
  {
    route: { page: "settings", setting: SettingTab.Security },
    Icon: SecurityIcon,
    title: "Security & Privacy",
    desc: "Choose which of the wallets belonging to the Secret Phrase you wish to add.",
  },
  {
    route: { page: "settings", setting: SettingTab.Web3 },
    Icon: WebIcon,
    title: "Web 3",
    desc: "Choose which of the wallets belonging to the Secret Phrase you wish to add.",
  },
  {
    route: { page: "settings", setting: SettingTab.Networks },
    Icon: NetworkIcon,
    title: "Networks",
    desc: "Add a new network or configure the settings of an existing one.",
  },
  {
    route: { page: "settings", setting: SettingTab.Advanced },
    Icon: AdvancedIcon,
    title: "Advanced",
    desc: "Enable test networks and other additional features.",
  },
  {
    route: { page: "settings", setting: SettingTab.About },
    Icon: AboutIcon,
    title: "About",
    desc: "",
  },
];
