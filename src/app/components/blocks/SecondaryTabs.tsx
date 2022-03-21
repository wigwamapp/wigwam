import { FC } from "react";
import classNames from "clsx";
import { Destination, Link } from "lib/navigation";

import ScrollAreaContainer from "app/components/elements/ScrollAreaContainer";
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
      "flex flex-col",
      "w-[calc(19.25rem+1px)] pr-6",
      "border-r border-brand-main/[.07]",
      className
    )}
    viewPortClassName="pb-20 rounded-t-[.625rem]"
    scrollBarClassName="py-0 pb-20 !right-1"
  >
    {tabs.map(({ title, route, desc }, i) => (
      <SecondaryItem
        key={title}
        title={title}
        route={route}
        desc={desc}
        isActive={route === activeRoute}
        className={classNames(i !== tabs.length - 1 && "mb-2")}
      />
    ))}
  </ScrollAreaContainer>
);

export default SecondaryTabs;

type SecondaryItemProps = {
  route: Destination;
  title: string;
  desc: string;
};

const SecondaryItem: FC<
  SecondaryItemProps & { isActive?: boolean; className?: string }
> = ({ title, route, desc, isActive = false, className }) => {
  return (
    <Link
      key={title}
      to={route}
      className={classNames(
        "relative group",
        "flex flex-col",
        "py-3 px-4 pr-[2.625rem]",
        "rounded-[.625rem]",
        "cursor-pointer",
        isActive && "bg-brand-main/10",
        !isActive && "hover:bg-brand-main/5",
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
          !isActive && "-translate-x-1.5 opacity-0",
          isActive && "translate-x-0 opacity-100"
        )}
      />
    </Link>
  );
};
