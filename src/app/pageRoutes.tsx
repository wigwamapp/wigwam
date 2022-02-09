import { match, when, not } from "ts-pattern";
import { Redirect } from "lib/navigation";

import { WalletStatus } from "core/types";

import { Page } from "app/defaults";

import Profiles from "./components/pages/Profiles";
import Unlock from "./components/pages/Unlock";
import Welcome from "./components/pages/Welcome";
import Main from "./components/pages/Main";

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
      // Unlcok when wallet locked
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
      // Redirect to default
      .otherwise(() => <Redirect to={{ page: Page.Default }} />)
  );
}
