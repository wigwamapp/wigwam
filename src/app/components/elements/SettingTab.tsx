import { FC } from "react";
import classNames from "clsx";
import { useAtom } from "jotai";
import { Link } from "lib/navigation";

import { settingTabAtom } from "app/atoms";
import { ReactComponent as ChevronDownIcon } from "app/icons/chevron-down.svg";
import { SettingTab } from "app/defaults";

interface SettingTabProps {
  title: string;
  route: SettingTab;
  desc: string;
}
const SettingsTab: FC<SettingTabProps> = ({ title, route, desc }) => {
  const [active] = useAtom(settingTabAtom);
  const isOpen = active === route;
  return (
    <Link
      key={title}
      to={{ page: "settings", setting: route }}
      className={classNames(
        "relative group",
        "flex flex-col",
        "py-3 px-4 mb-2",
        "rounded-[10px]",
        "cursor-pointer",
        isOpen && "bg-brand-main/10",
        !isOpen && "hover:bg-brand-main/5",
        "last:mb-0"
      )}
    >
      <h3 className="text-base font-bold">{title}</h3>
      <p className="text-xs text-[#BCC2DB] pt-[4px]">{desc}</p>
      <div
        className={classNames(
          isOpen && "translate-x-0 opacticy-100",
          !isOpen && "translate-x-[-4px] opacity-0",
          "absolute right-4 inset-y-1/2",
          "transition-transform rotate-[270deg]",
          "group-hover:translate-x-0 group-hover:opacity-100"
        )}
      >
        <ChevronDownIcon />
      </div>
    </Link>
  );
};

export default SettingsTab;
