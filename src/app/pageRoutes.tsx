import { match, when, not, __ } from "ts-pattern";
import { Redirect } from "lib/navigation";

import { WalletStatus } from "core/types";

import { Page } from "app/defaults";

import Profiles from "./components/screens/Profiles";
import Unlock from "./components/screens/Unlock";
import Welcome from "./components/screens/Welcome";
import Main from "./components/screens/Main";

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
      .with(__, () => <Main />)
      // Redirect to default
      .otherwise(() => <Redirect to={{ page: Page.Default }} />)
  );
}
