import { FC } from "react";
import classNames from "clsx";
import { useAtomValue } from "jotai";
import { Link } from "lib/navigation";

import { SettingTab } from "app/defaults";
import { settingTabAtom } from "app/atoms";
import { ReactComponent as ChevronRightIcon } from "app/icons/chevron-right.svg";

type SettingsTabProps = {
  title: string;
  route: SettingTab;
  desc: string;
  className?: string;
};

const SettingsTab: FC<SettingsTabProps> = ({
  title,
  route,
  desc,
  className,
}) => {
  const activeTabRoute = useAtomValue(settingTabAtom);
  const isOpen = activeTabRoute === route;
  return (
    <Link
      key={title}
      to={{ page: "settings", setting: route }}
      className={classNames(
        "relative group",
        "flex flex-col",
        "py-3 px-4 pr-[2.625rem]",
        "rounded-[10px]",
        "cursor-pointer",
        isOpen && "bg-brand-main/10",
        !isOpen && "hover:bg-brand-main/5",
        className
      )}
    >
      <h3 className="text-base font-bold">{title}</h3>
      <p className="text-xs text-[#BCC2DB] pt-1">{desc}</p>
      <ChevronRightIcon
        className={classNames(
          "absolute right-2.5 top-1/2 -translate-y-1/2",
          "transition",
          "group-hover:translate-x-0 group-hover:opacity-100",
          !isOpen && "-translate-x-1.5 opacity-0",
          isOpen && "translate-x-0 opacity-100"
        )}
      />
    </Link>
  );
};

export default SettingsTab;
