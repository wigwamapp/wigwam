import React, { useMemo, useLayoutEffect } from "react";
import { Router, useLocation, HistoryAction } from "woozie";
import { ROUTE_MAP } from "app/defaults";

const PageRouter: React.FC = () => {
  const { trigger, pathname } = useLocation();

  // Scroll to top after new location pushed.
  useLayoutEffect(() => {
    if (trigger === HistoryAction.Push) {
      window.scrollTo(0, 0);
    }
  }, [trigger, pathname]);

  return useMemo(() => Router.resolve(ROUTE_MAP, pathname, null), [pathname]);
};

export default PageRouter;
