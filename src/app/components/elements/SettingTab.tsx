import { FC } from "react";
import classNames from "clsx";
import { useAtom } from "jotai";
import { Link } from "lib/navigation";

import { settingTabAtom } from "app/atoms";
import { ReactComponent as ChevronDownIcon } from "app/icons/chevron-down.svg";
import { SettingTabs } from "app/defaults";

interface SettingTabProps {
  title: SettingTabs;
  desc: string;
}
const SettingTab: FC<SettingTabProps> = ({ title, desc }) => {
  const [active] = useAtom(settingTabAtom);
  return (
    <Link
      key={title}
      to={{ page: "settings", setting: title }}
      className={classNames(
        "relative",
        "flex flex-col",
        "py-3 px-4 mb-2",
        "rounded-[10px]",
        "cursor-pointer",
        active === title && "bg-brand-main/10",
        "hover:bg-brand-main/5",
        "focus:bg-brand-main/5",
        "last:mb-0"
      )}
    >
      <h3 className="text-base">{title}</h3>
      <p className="text-xs text-[#BCC2DB] pt-[4px]">{desc}</p>
      <div
        className={classNames(
          "absolute right-4 inset-y-1/2",
          "transition-transform rotate-[270deg]"
        )}
      >
        <ChevronDownIcon />
      </div>
    </Link>
  );
};

export default SettingTab;
