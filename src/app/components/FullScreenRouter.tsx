import { FC, useMemo, useLayoutEffect } from "react";
import { useAtomValue } from "jotai";
import { waitForAll } from "jotai/utils";
import { match, when, not, __ } from "ts-pattern";
import { getLastAction, HistoryAction, resetPosition } from "lib/history";
import { Redirect } from "lib/navigation";

import { WalletStatus } from "core/types";

import { walletStatusAtom, pageAtom } from "app/atoms";
import { Page } from "app/nav";

import Profiles from "./screens/Profiles";
import Unlock from "./screens/Unlock";
import Welcome from "./screens/Welcome";
import Main from "./screens/Main";

const FullScreenRouter: FC = () => {
  const { page, walletStatus } = useAtomValue(
    useMemo(
      () =>
        waitForAll({
          page: pageAtom,
          walletStatus: walletStatusAtom,
        }),
      []
    )
  );

  // Scroll to top after new page pushed.
  const lastHistoryAction = getLastAction();
  useLayoutEffect(() => {
    if (lastHistoryAction === HistoryAction.Push) {
      window.scrollTo(0, 0);
    }

    if (page === Page.Default) {
      resetPosition();
    }
  }, [page, lastHistoryAction]);

  return useMemo(
    () => matchFullScreen({ page, walletStatus }),
    [page, walletStatus]
  );
};

export default FullScreenRouter;

function matchFullScreen(params: { page: Page; walletStatus: WalletStatus }) {
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
