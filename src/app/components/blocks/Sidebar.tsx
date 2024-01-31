import { FC, ReactNode } from "react";
import classNames from "clsx";
import { useAtomValue } from "jotai";

import { Link } from "lib/navigation";
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
        "pr-8",
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
          "mt-[6.25rem] pt-8",
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
  badge?: boolean;
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

        if (typeof action === "function") {
          return (
            <button
              key={label}
              onClick={action}
              className={classNames(
                "group",
                "text-base !font-bold text-brand-light/80",
                "w-52 !py-2 !px-3 !mb-2",
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
              "text-base font-bold text-brand-light/80",
              "w-52 py-2 px-3 mb-2",
              "rounded-[.625rem]",
              "flex items-center",
              "transition-colors",
              "group",
              "hover:text-brand-light",
              "focus:text-brand-light",
              isPageActive && "bg-brand-main/5 !text-brand-light",
              "last:mb-0",
            )}
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

export const BadgeWrapper: FC<{
  showBadge: boolean | undefined;
  children: ReactNode | ReactNode[];
}> = ({ showBadge, children }) => (
  <div
    className={classNames(
      "mr-5 relative",
      showBadge && [
        "after:content-[' '] after:absolute after:right-[1px] after:top-0 after:h-2 after:w-2",
        "after:bg-brand-redtwo after:rounded-full",
      ],
    )}
  >
    {children}
  </div>
);

const LinkContent: FC<{
  link: SidebarLink;
  isActive: boolean;
  hasNotification: boolean;
}> = ({ link, isActive, hasNotification }) => {
  const { Icon, label, soon } = link;

  return (
    <>
      <BadgeWrapper showBadge={link.badge}>
        <Icon
          className={classNames(
            "w-7 h-7",
            "min-w-7",
            "styled-icon",
            isActive
              ? "styled-icon--active"
              : "group-hover:styled-icon--hover group-focus:styled-icon--hover",
          )}
        />
      </BadgeWrapper>
      {label}
      {hasNotification && (
        <div className="ml-1.5 h-5">
          <div className={classNames("w-2 h-2", "bg-activity rounded-full")} />
        </div>
      )}
      {soon && <SoonTag />}
    </>
  );
};
