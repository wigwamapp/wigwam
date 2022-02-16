import { FC, useMemo, useLayoutEffect } from "react";
import { useAtomValue } from "jotai";
import { waitForAll } from "jotai/utils";
import { getLastAction, HistoryAction, resetPosition } from "lib/history";

import { walletStatusAtom, pageAtom } from "app/atoms";
import { matchPage } from "app/pageRoutes";
import { Page } from "app/defaults";

const PageRouter: FC = () => {
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

  return useMemo(() => matchPage({ page, walletStatus }), [page, walletStatus]);
};

export default PageRouter;
