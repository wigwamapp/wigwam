import { useMemo } from "react";
import { Page } from "app/nav";
import { useSetAtom } from "jotai";

import { ReactComponent as OverviewIcon } from "app/icons/Overview.svg";
import { ReactComponent as ReceiveIcon } from "app/icons/Receive.svg";
import { ReactComponent as SendIcon } from "app/icons/Send.svg";
import { ReactComponent as SwapIcon } from "app/icons/SwapIcon.svg";
// import { ReactComponent as AppsIcon } from "app/icons/Apps.svg";
import { ReactComponent as ContactsIcon } from "app/icons/Contacts.svg";
import { ReactComponent as WalletsIcon } from "app/icons/Wallets.svg";
import { ReactComponent as SettingsIcon } from "app/icons/Settings.svg";
import { ReactComponent as SupportIcon } from "app/icons/Support.svg";
import { ReactComponent as ActivityIcon } from "app/icons/ActivityIcon.svg";
import * as SupportAlert from "app/components/elements/SupportAlert";
import { useDialog } from "app/hooks/dialog";
import { activityModalAtom } from "app/atoms";
import { useActivityBadge, useSwapBadge } from "app/hooks";

const useSidebarLinks = () => {
  const { alert } = useDialog();
  const setActivityOpened = useSetAtom(activityModalAtom);
  const activityBadgeDisplayed = useActivityBadge();
  const swapBadgeDisplayed = useSwapBadge();

  const NavLinksPrimary = useMemo(() => {
    return [
      {
        route: Page.Default,
        label: "Overview",
        Icon: OverviewIcon,
      },
      {
        label: "Activity",
        Icon: ActivityIcon,
        action: () => setActivityOpened([true, "replace"]),
        badge: activityBadgeDisplayed,
      },
      {
        route: Page.Receive,
        label: "Buy",
        Icon: ReceiveIcon,
      },
      {
        route: Page.Transfer,
        label: "Send",
        Icon: SendIcon,
      },
      {
        route: Page.Swap,
        label: "Swap",
        Icon: SwapIcon,
        badge: swapBadgeDisplayed,
      },
      // {
      //   route: Page.Apps,
      //   label: "Apps",
      //   Icon: AppsIcon,
      //   soon: true,
      // },
    ];
  }, [activityBadgeDisplayed, swapBadgeDisplayed, setActivityOpened]);

  const NavLinksSecondary = useMemo(() => {
    return [
      {
        route: Page.Contacts,
        label: "Contacts",
        Icon: ContactsIcon,
      },
      {
        route: Page.Wallets,
        label: "Wallets",
        Icon: WalletsIcon,
      },
      {
        route: Page.Settings,
        label: "Settings",
        Icon: SettingsIcon,
      },
      {
        label: "Support",
        Icon: SupportIcon,
        action: () =>
          alert({
            title: <SupportAlert.Title />,
            content: <SupportAlert.Content />,
          }),
      },
    ];
  }, [alert]);

  return useMemo(
    () => ({
      NavLinksPrimary,
      NavLinksSecondary,
    }),
    [NavLinksPrimary, NavLinksSecondary],
  );
};

export default useSidebarLinks;
