import { FC, Suspense } from "react";
import classNames from "clsx";

import { SettingTab } from "app/nav";
import SettingsItem from "app/components/elements/SettingsItem";
import ScrollAreaContainer from "app/components/elements/ScrollAreaContainer";

import SettingsTab from "./Settings.Tab";

const Settings: FC = () => (
  <div className="flex mt-5 min-h-0 grow">
    <Tabs />

    <Suspense fallback={null}>
      <SettingsTab />
    </Suspense>
  </div>
);

export default Settings;

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
      <SettingsItem
        key={title}
        title={title}
        route={route}
        desc={desc}
        className={classNames(i !== tabsContent.length - 1 && "mb-2")}
      />
    ))}
  </ScrollAreaContainer>
);

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
