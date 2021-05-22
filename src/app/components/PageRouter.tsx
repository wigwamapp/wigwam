import { useMemo, useLayoutEffect } from "react";
import { Router, useLocation, HistoryAction } from "woozie";
import { useQuery } from "react-query";
import { walletStatusQuery } from "app/queries";
import { ROUTE_MAP, RouterContext } from "app/defaults";

const PageRouter: React.FC = () => {
  const { trigger, pathname } = useLocation();
  const walletStatus = useQuery(walletStatusQuery).data!;

  const ctx = useMemo<RouterContext>(() => ({ walletStatus }), [walletStatus]);

  // Scroll to top after new location pushed.
  useLayoutEffect(() => {
    if (trigger === HistoryAction.Push) {
      window.scrollTo(0, 0);
    }
  }, [trigger, pathname]);

  return useMemo(
    () => Router.resolve(ROUTE_MAP, pathname, ctx),
    [pathname, ctx]
  );
};

export default PageRouter;
