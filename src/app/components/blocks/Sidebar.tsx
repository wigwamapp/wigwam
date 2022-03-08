import { FC } from "react";
import classNames from "clsx";
import { useAtomValue } from "jotai";

import { Link } from "lib/navigation";
import { Page, SettingTabs } from "app/defaults";
import { pageAtom } from "app/atoms";
import { ReactComponent as VigvamIcon } from "app/icons/Vigvam.svg";

import { NavLinksPrimary, NavLinksSecondary } from "./Sidebar.Links";

const Sidebar: FC = () => (
  <nav
    className={classNames(
      "pr-8",
      "border-r border-brand-main/[.07]",
      "flex flex-col"
    )}
  >
    <Link
      to={{ page: Page.Overview }}
      className={classNames(
        "mb-5 py-5",
        "border-b border-brand-main/[.07]",
        "flex items-center",
        "text-2xl font-black"
      )}
    >
      <VigvamIcon className={classNames("h-10 w-auto", "mr-5")} />
      Vigvam
    </Link>
    <SidebarBlock links={NavLinksPrimary} />
    <SidebarBlock
      links={NavLinksSecondary}
      className={classNames(
        "mt-[6.25rem] pt-8",
        "border-t border-brand-main/[.07]"
      )}
    />
  </nav>
);

type SidebarBlockProps = {
  links: {
    route: Page;
    label: string;
    Icon: FC<{ className?: string }>;
  }[];
  className?: string;
};

const SidebarBlock: FC<SidebarBlockProps> = ({ links, className }) => {
  const page = useAtomValue(pageAtom);

  return (
    <div className={classNames("flex flex-col", className)}>
      {links.map(({ route, label, Icon }) => {
        const isPageActive =
          route === (page === Page.Default ? Page.Overview : page);

        const link =
          route === Page.Settings
            ? {
                page: route,
                setting: SettingTabs.General,
              }
            : { page: route };
        return (
          <Link
            key={route}
            to={link}
            className={classNames(
              "group",
              "text-base font-bold text-brand-light/80",
              "w-52 py-2 px-3 mb-2",
              "rounded-[.625rem]",
              "flex items-center",
              "transition-colors",
              "hover:text-brand-light",
              "focus:text-brand-light",
              isPageActive && "bg-brand-main/5 !text-brand-light",
              "last:mb-0"
            )}
          >
            <Icon
              className={classNames(
                "w-7 h-7",
                "min-w-7",
                "mr-5",
                "glass-icon",
                isPageActive && "glass-icon--active",
                "group-hover:glass-icon--hover",
                "group-focus:glass-icon--hover"
              )}
            />
            {label}
          </Link>
        );
      })}
    </div>
  );
};

export default Sidebar;
