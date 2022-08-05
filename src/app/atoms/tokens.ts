import { atomFamily, atomWithStorage } from "jotai/utils";
import { dequal } from "dequal/lite";
import { atomWithRepoQuery } from "lib/atom-utils";

import * as repo from "core/repo";
import { TokenType } from "core/types";
import { createAccountTokenKey } from "core/common/tokens";

export const getAccountTokensAtom = atomFamily(
  (params: repo.QueryAccountTokensParams) =>
    atomWithRepoQuery((query) => query(() => repo.queryAccountTokens(params))),
  dequal
);

export type GetTokenAtomParams = {
  chainId: number;
  accountAddress: string;
  tokenSlug: string;
};

export const getTokenAtom = atomFamily(
  ({ chainId, accountAddress, tokenSlug }: GetTokenAtomParams) =>
    atomWithRepoQuery((query) =>
      query(() =>
        repo.accountTokens.get(
          createAccountTokenKey({ chainId, accountAddress, tokenSlug })
        )
      )
    ),
  dequal
);

export const tokenTypeAtom = atomWithStorage<TokenType>(
  "token_type",
  TokenType.Asset
);
