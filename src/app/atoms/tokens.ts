import { atomFamily } from "jotai/utils";
import { dequal } from "dequal/lite";
import { atomWithRepoQuery } from "lib/atom-utils";

import * as Repo from "core/repo";

export const getAccountTokensAtom = atomFamily(
  (params: Repo.QueryAccountTokensParams) =>
    atomWithRepoQuery((query) => query(() => Repo.queryAccountTokens(params))),
  dequal
);

export const getTokenAtom = atomFamily(
  ({ chainId, accountAddress, tokenSlug }) =>
    atomWithRepoQuery((query) =>
      query(() =>
        Repo.accountTokens.get([chainId, accountAddress, tokenSlug].join("_"))
      )
    ),
  dequal
);
