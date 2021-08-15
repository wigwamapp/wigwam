import { FC, useMemo, useLayoutEffect } from "react";
import { useAtomValue } from "jotai/utils";
import {
  getLastAction,
  HistoryAction,
  resetHistoryPosition,
} from "lib/history";
import { getAllProfiles } from "lib/ext/profile";

import { walletStatusAtom, pageAtom } from "app/atoms";
import { matchPage } from "app/pageRoutes";
import { Page } from "app/defaults";

const PageRouter: FC = () => {
  const walletStatus = useAtomValue(walletStatusAtom);
  const page = useAtomValue(pageAtom);
  const profileCount = useMemo(() => getAllProfiles().length, []);

  // Scroll to top after new page pushed.
  const lastHistoryAction = getLastAction();
  useLayoutEffect(() => {
    if (lastHistoryAction === HistoryAction.Push) {
      window.scrollTo(0, 0);
    }

    if (page === Page.Default) {
      resetHistoryPosition();
    }
  }, [page, lastHistoryAction]);

  return useMemo(
    () => matchPage({ page, walletStatus, profileCount }),
    [page, walletStatus, profileCount]
  );
};

export default PageRouter;
