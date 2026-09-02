import { FC, useMemo } from "react";
import classNames from "clsx";
import { useAtomValue } from "jotai";

import { settingTabAtom } from "app/atoms";
import { SettingTab as SettingTabEnum } from "app/nav";
import SecondaryTabs from "app/components/blocks/SecondaryTabs";
import ScrollAreaContainer from "app/components/elements/ScrollAreaContainer";
import { ReactComponent as GeneralIcon } from "app/icons/setting-general.svg";
import { ReactComponent as ProfileIcon } from "app/icons/setting-profile.svg";
import { ReactComponent as SecurityIcon } from "app/icons/setting-security.svg";
import { ReactComponent as WebIcon } from "app/icons/setting-web3.svg";
import { ReactComponent as NetworkIcon } from "app/icons/setting-network.svg";
import { ReactComponent as AboutIcon } from "app/icons/setting-about.svg";

import SettingsTab from "./Settings.Tab";

const Settings: FC = () => {
  const activeTabRoute = useAtomValue(settingTabAtom);

  const activeRoute = useMemo(
    () =>
      tabsContent.find(({ route }) => route.setting === activeTabRoute)?.route,
    [activeTabRoute],
  );

  return (
    <div
      className={classNames(
        "px-6 -mx-6 min-h-0",
        "flex grow",
        "overflow-x-auto scrollbar-hide",
      )}
    >
      <SecondaryTabs tabs={tabsContent} activeRoute={activeRoute} />

      {activeTabRoute !== SettingTabEnum.Networks ? (
        <ScrollAreaContainer
          className="box-content w-full pr-6"
          viewPortClassName="pb-5 pt-5 pl-6"
          scrollBarClassName="py-0 pt-5 pb-5"
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
    Icon: GeneralIcon,
    title: "General",
    desc: "Control display and appearance. Language, currency etc.",
  },
  {
    route: { page: "settings", setting: SettingTabEnum.Profile },
    Icon: ProfileIcon,
    title: "Profile",
    desc: "Update profile name or avatar. Change profile password.",
  },
  {
    route: { page: "settings", setting: SettingTabEnum.Security },
    Icon: SecurityIcon,
    title: "Security & Privacy",
    desc: "Back up your current Secret Phrase and other security settings.",
  },
  {
    route: { page: "settings", setting: SettingTabEnum.Web3 },
    Icon: WebIcon,
    title: "Web3",
    desc: "Control access and permissions for decentralized applications.",
  },
  {
    route: { page: "settings", setting: SettingTabEnum.Networks },
    Icon: NetworkIcon,
    title: "Networks",
    desc: "Add a new network or configure the settings of an existing one.",
  },
  {
    route: { page: "settings", setting: SettingTabEnum.About },
    Icon: AboutIcon,
    title: "About",
    desc: "Check current Wigwam version. Find us elsewhere.",
  },
];
