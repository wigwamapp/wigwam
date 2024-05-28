import { FC } from "react";
import classNames from "clsx";
import { useAtomValue } from "jotai";
import { Link } from "lib/navigation";

import { TEvent, trackEvent } from "core/client";

import { Page } from "app/nav";
import { SoonTag } from "app/components/elements/SoonTag";
import { updateAvailableAtom, pageAtom, tokenSlugAtom } from "app/atoms";
import { ReactComponent as WigwamTitleIcon } from "app/icons/WigwamTitle.svg";

import useSidebarLinks from "./Sidebar.Links";

const Sidebar: FC = () => {
  const { NavLinksPrimary, NavLinksSecondary } = useSidebarLinks();

  return (
    <nav
      className={classNames(
        "pr-6",
        "border-r border-brand-main/[.07]",
        "flex flex-col",
      )}
    >
      <Link
        to={{ page: Page.Default }}
        merge={["token"]}
        className={classNames(
          "mb-5 py-5",
          "border-b border-brand-main/[.07]",
          "flex items-center",
          "text-2xl font-black",
        )}
      >
        <WigwamTitleIcon className={classNames("ml-3 my-1 h-8 w-auto")} />
      </Link>
      <SidebarBlock links={NavLinksPrimary} />
      <SidebarBlock
        links={NavLinksSecondary}
        className={classNames(
          "mt-[6.25rem] pt-4",
          "border-t border-brand-main/[.07]",
        )}
      />
    </nav>
  );
};

export default Sidebar;

type SidebarLink = {
  label: string;
  Icon: FC<{ className?: string }>;
  route?: Page;
  soon?: boolean;
  badge?: number;
  action?: () => void;
};

type SidebarBlockProps = {
  links: SidebarLink[];
  className?: string;
};

const SidebarBlock: FC<SidebarBlockProps> = ({ links, className }) => {
  const page = useAtomValue(pageAtom);
  const tokenSlug = useAtomValue(tokenSlugAtom);
  const updateAvailable = useAtomValue(updateAvailableAtom);

  return (
    <div className={classNames("flex flex-col", className)}>
      {links.map((link) => {
        const { route, label, action } = link;
        const isPageActive = route === page;
        const notificationBadge = route === Page.Settings && updateAvailable;

        const handleClick = () => {
          if (isPageActive) return;

          action?.();

          trackEvent(TEvent.SidebarNavigated, {
            label,
            latestPage: page,
          });
        };

        if (!route && typeof action === "function") {
          return (
            <button
              key={label}
              onClick={handleClick}
              className={classNames(
                "group",
                "text-base !font-bold text-brand-light/80",
                "w-48 !py-2 !px-3 !mb-2",
                "rounded-[.625rem]",
                "flex justify-start items-center",
                isPageActive && "!bg-brand-main/5 !text-brand-light",
                "last:mb-0",
                "hover:text-brand-light",
              )}
            >
              <LinkContent
                hasNotification={notificationBadge}
                isActive={isPageActive}
                link={link}
              />
            </button>
          );
        }

        return (
          <Link
            type="button"
            key={route}
            to={{
              page: route,
            }}
            merge={withTokenSlug(page, tokenSlug) ? ["token"] : undefined}
            className={classNames(
              "group",
              "text-base font-bold",
              "w-48 py-2 px-3 mb-2",
              "rounded-[.625rem]",
              "flex items-center",
              "transition-colors",
              "text-brand-light/80 hover:text-brand-light focus:text-brand-light",
              "group",
              isPageActive && "bg-brand-main/5 !text-brand-light",
              "last:mb-0",
            )}
            onClick={handleClick}
          >
            <LinkContent
              hasNotification={notificationBadge}
              isActive={isPageActive}
              link={link}
            />
          </Link>
        );
      })}
    </div>
  );
};

const withTokenSlug = (page: Page, tokenSlug: string | null) =>
  (page === Page.Default || page === Page.Transfer || page === Page.Swap) &&
  tokenSlug;

const LinkContent: FC<{
  link: SidebarLink;
  isActive: boolean;
  hasNotification: boolean;
}> = ({ link, isActive, hasNotification }) => {
  const { Icon, label, soon, badge } = link;

  return (
    <>
      <Icon
        className={classNames(
          "w-7 h-7",
          "min-w-7",
          "mr-4",
          "styled-icon",
          badge && !isActive ? "styled-icon--pending" : "",
          isActive
            ? "styled-icon--active"
            : "group-hover:styled-icon--hover group-focus:styled-icon--hover",
        )}
      />
      <span
        className={classNames(
          "flex items-center",
          badge && !isActive ? "styled-label--pending" : "",
        )}
      >
        {label}
        {badge && badge > 0 ? (
          <span className="bg-brand-darkgray border border-white/5 text-white text-xs !text-brand-light/80 rounded-md py-0.5 px-1.5 ml-2 mt-0.5">
            +{badge}
          </span>
        ) : null}
      </span>
      {hasNotification && (
        <div className="ml-1.5 h-5">
          <div className={classNames("w-2 h-2", "bg-activity rounded-full")} />
        </div>
      )}
      {soon && <SoonTag />}
    </>
  );
};
