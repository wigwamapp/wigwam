import { Router, Redirect } from "woozie";

import { WalletStatus } from "core/types";

import Profiles from "./components/pages/Profiles";
import Unlock from "./components/pages/Unlock";
import Welcome from "./components/pages/Welcome";
import Main from "./components/pages/Main";
import Setup from "./components/pages/Setup";

export interface RouterContext {
  walletStatus: WalletStatus;
}

export const ROUTE_MAP = Router.createMap<RouterContext>([
  [
    "/profiles",
    (_p, ctx) =>
      [WalletStatus.Welcome, WalletStatus.Locked].includes(ctx.walletStatus) ? (
        <Profiles />
      ) : (
        Router.SKIP
      ),
  ],
  // Unlcok when wallet locked
  [
    "*",
    (_p, ctx) => {
      switch (ctx.walletStatus) {
        case WalletStatus.Idle:
          return null;

        case WalletStatus.Locked:
          return <Unlock />;

        default:
          return Router.SKIP;
      }
    },
  ],
  [
    "/",
    (_p, ctx) =>
      ctx.walletStatus === WalletStatus.Welcome ? <Welcome /> : <Main />,
  ],
  ["/setup", () => <Setup />],
  [
    "*",
    (_p, ctx) =>
      ctx.walletStatus === WalletStatus.Ready ? (
        Router.SKIP
      ) : (
        <Redirect to="/" />
      ),
  ],
  // Only ready below
  ["*", () => <Redirect to="/" />],
]);
