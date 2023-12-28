import { useMemo } from "react";
import { Page } from "app/nav";
import { ReactComponent as OverviewIcon } from "app/icons/Overview.svg";
import { ReactComponent as ReceiveIcon } from "app/icons/Receive.svg";
import { ReactComponent as SendIcon } from "app/icons/Send.svg";
import { ReactComponent as SwapIcon } from "app/icons/SwapIcon.svg";
import { ReactComponent as AppsIcon } from "app/icons/Apps.svg";
import { ReactComponent as ContactsIcon } from "app/icons/Contacts.svg";
import { ReactComponent as WalletsIcon } from "app/icons/Wallets.svg";
import { ReactComponent as SettingsIcon } from "app/icons/Settings.svg";
import { ReactComponent as SupportIcon } from "app/icons/Support.svg";
import * as SupportAlert from "app/components/elements/SupportAlert";
import { useDialog } from "app/hooks/dialog";

const useSidebarLinks = () => {
  const { alert } = useDialog();

  const NavLinksPrimary = useMemo(() => {
    return [
      {
        route: Page.Default,
        label: "Overview",
        Icon: OverviewIcon,
      },
      {
        route: Page.Receive,
        label: "Receive",
        Icon: ReceiveIcon,
      },
      {
        route: Page.Transfer,
        label: "Transfer",
        Icon: SendIcon,
      },
      {
        route: Page.Swap,
        label: "Swap",
        Icon: SwapIcon,
      },
      {
        route: Page.Apps,
        label: "Apps",
        Icon: AppsIcon,
        soon: true,
      },
      {
        route: Page.Contacts,
        label: "Contacts",
        Icon: ContactsIcon,
      },
    ];
  }, []);

  const NavLinksSecondary = useMemo(() => {
    return [
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
