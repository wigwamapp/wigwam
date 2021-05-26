import { Router, Redirect } from "woozie";
import { QueryClient } from "react-query";

import { WalletStatus } from "core/types";

import Unlock from "./components/pages/Unlock";
import Welcome from "./components/pages/Welcome";
import Main from "./components/pages/Main";
import AddAccount from "./components/pages/AddAccount";

export interface RouterContext {
  walletStatus: WalletStatus;
}

export const ROUTE_MAP = Router.createMap<RouterContext>([
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
  ["/add-account", () => <AddAccount />],
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

export const QUERY_CLIENT = new QueryClient({
  defaultOptions: {
    queries: {
      suspense: true,
    },
  },
});

export const FONTS: [string, number[]][] = [["Inter", [300, 400, 600, 700]]];

export const BSC_CHAIN_ID = 56;
export const BSC_RPC_URLS = [
  "https://bsc-dataseed.binance.org/",
  "https://bsc-dataseed1.defibit.io/",
  "https://bsc-dataseed1.ninicoin.io/",
];
