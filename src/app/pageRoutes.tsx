import { match, when, not } from "ts-pattern";
import { Redirect } from "lib/navigation";

import { WalletStatus } from "core/types";

import { Page } from "app/defaults";

import Profiles from "./components/pages/Profiles";
import Unlock from "./components/pages/Unlock";
import Welcome from "./components/pages/Welcome";
import Main from "./components/pages/Main";
import Overview from "./components/pages/Overview";
import Receive from "./components/pages/Receive";
import Transfer from "./components/pages/Transfer";
import Swap from "./components/pages/Swap";
import Apps from "./components/pages/Apps";
import Contacts from "./components/pages/Contacts";
import Wallets from "./components/pages/Wallets";
import Settings from "./components/pages/Settings";

export type MatchPageParams = {
  page: Page;
  walletStatus: WalletStatus;
};

export function matchPage(params: MatchPageParams) {
  return (
    match(params)
      .with({ walletStatus: WalletStatus.Idle }, () => null)
      .with(
        {
          page: Page.Profiles,
          walletStatus: when((s) =>
            [WalletStatus.Welcome, WalletStatus.Locked].includes(s)
          ),
        },
        () => <Profiles />
      )
      // Unlock when wallet locked
      .with({ walletStatus: WalletStatus.Locked }, () => <Unlock />)
      .with(
        {
          page: Page.Default,
          walletStatus: WalletStatus.Welcome,
        },
        () => <Welcome />
      )
      // Only ready below
      .with({ walletStatus: not(WalletStatus.Unlocked) }, () => (
        <Redirect to={{ page: Page.Default }} />
      ))
      .with({ page: Page.Default }, () => <Main />)
      .with({ page: Page.Overview }, () => <Overview />)
      .with({ page: Page.Receive }, () => <Receive />)
      .with({ page: Page.Transfer }, () => <Transfer />)
      .with({ page: Page.Swap }, () => <Swap />)
      .with({ page: Page.Apps }, () => <Apps />)
      .with({ page: Page.Contacts }, () => <Contacts />)
      .with({ page: Page.Wallets }, () => <Wallets />)
      .with({ page: Page.Settings }, () => <Settings />)
      // Redirect to default
      .otherwise(() => <Redirect to={{ page: Page.Default }} />)
  );
}
