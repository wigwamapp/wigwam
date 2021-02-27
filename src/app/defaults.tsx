import React from "react";
import { Router, Redirect } from "woozie";
import { QueryClient } from "react-query";
import Main from "app/components/pages/Main";

export const ROUTE_MAP = Router.createMap([
  ["/", () => <Main />],
  ["*", () => <Redirect to="/" />],
]);

export const QUERY_CLIENT = new QueryClient({
  defaultOptions: {
    queries: {
      suspense: true,
      refetchOnWindowFocus: false,
    },
  },
});

export const FONTS: [string, number[]][] = [["Inter", [300, 400, 600, 700]]];
