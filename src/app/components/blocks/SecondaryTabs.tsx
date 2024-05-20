import { FC } from "react";
import classNames from "clsx";
import { Destination, Link } from "lib/navigation";

import ScrollAreaContainer from "app/components/elements/ScrollAreaContainer";
import Separator from "app/components/elements/Seperator";
import { SoonTag } from "app/components/elements/SoonTag";
import { ReactComponent as ChevronRightIcon } from "app/icons/chevron-right.svg";

type SecondaryTabsProps = {
  tabs: SecondaryItemProps[];
  activeRoute?: Destination;
  className?: string;
};

const SecondaryTabs: FC<SecondaryTabsProps> = ({
  tabs,
  activeRoute,
  className,
}) => (
  <ScrollAreaContainer
    className={classNames(
      "relative",
      "flex flex-col",
      "w-[calc(21.25rem+1px)] min-w-[calc(21.25rem+1px)] pr-6",
      className,
    )}
    viewPortClassName="pb-5 rounded-t-[.625rem] pt-5"
    scrollBarClassName="py-0 pt-5 pb-5 !right-1"
  >
    {tabs.map(({ title, Icon, route, desc, soon }, i) => (
      <SecondaryItem
        key={title}
        title={title}
        Icon={Icon}
        route={route}
        desc={desc}
        soon={soon}
        isActive={route === activeRoute}
        className={classNames(i !== tabs.length - 1 && "mb-2")}
      />
    ))}
    <Separator direction="vertical" position="end" className="!top-5" />
  </ScrollAreaContainer>
);

export default SecondaryTabs;

type SecondaryItemProps = {
  route: Destination;
  Icon?: FC<{ className?: string }>;
  title: string;
  desc: string;
  soon?: boolean;
};

const SecondaryItem: FC<
  SecondaryItemProps & { isActive?: boolean; className?: string }
> = ({ title, route, Icon, desc, soon, isActive = false, className }) => {
  return (
    <Link
      key={title}
      to={route}
      onClick={(e) => isActive && e.preventDefault()}
      className={classNames(
        "relative group",
        "flex flex-col",
        "py-3 px-4 pr-[2.625rem]",
        "rounded-[.625rem]",
        "cursor-pointer",
        "group",
        isActive && "bg-brand-main/10",
        !isActive && "hover:bg-brand-main/5",
        className,
      )}
    >
      <div className="flex items-center">
        {Icon && <Icon className="w-[1.125rem] h-auto mr-2" />}
        <h3 className={"text-base font-bold"}>{title}</h3>
        {soon && <SoonTag />}
      </div>
      {desc && <p className="text-sm text-[#BCC3C4] mt-1">{desc}</p>}
      <ChevronRightIcon
        className={classNames(
          "w-6 h-auto",
          "absolute right-2.5 top-1/2 -translate-y-1/2",
          "transition",
          "group-hover:translate-x-0 group-hover:opacity-100",
          !isActive && "-translate-x-1.5 opacity-0",
          isActive && "translate-x-0 opacity-100",
        )}
      />
    </Link>
  );
};
