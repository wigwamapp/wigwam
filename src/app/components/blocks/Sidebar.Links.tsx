import { Page } from "app/nav";
import { ReactComponent as OverviewIcon } from "app/icons/Overview.svg";
import { ReactComponent as ReceiveIcon } from "app/icons/Receive.svg";
import { ReactComponent as SendIcon } from "app/icons/Send.svg";
import { ReactComponent as SwapIcon } from "app/icons/SwapIcon.svg";
import { ReactComponent as AppsIcon } from "app/icons/Apps.svg";
import { ReactComponent as ContactsIcon } from "app/icons/Contacts.svg";
import { ReactComponent as WalletsIcon } from "app/icons/Wallets.svg";
import { ReactComponent as SettingsIcon } from "app/icons/Settings.svg";

export const NavLinksPrimary = [
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

export const NavLinksSecondary = [
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
];
