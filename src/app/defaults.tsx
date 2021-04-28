import { Router, Redirect } from "woozie";
import { QueryClient } from "react-query";
// import { match } from "ts-pattern";
import { WalletStatus } from "core/types";
// import Welcome from "app/components/pages/Welcome";
import Main from "app/components/pages/Main";

export interface RouterContext {
  walletStatus: WalletStatus;
}

export const ROUTE_MAP = Router.createMap<RouterContext>([
  // [
  //   "*",
  //   (_p, ctx) =>
  //     match(ctx.walletStatus)
  //       .with(WalletStatus.Locked, () => <Main />)
  //       .with(WalletStatus.Welcome, () => <Welcome />)
  //       .otherwise(() => Router.SKIP),
  // ],
  ["/", () => <Main />],
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
