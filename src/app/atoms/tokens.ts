import { atomFamily, atomWithDefault } from "jotai/utils";
import { dequal } from "dequal/lite";
import { atomWithRepoQuery, atomWithStorage } from "lib/atom-utils";

import * as repo from "core/repo";
import { TokenType } from "core/types";
import {
  createAccountTokenKey,
  createTotalBalanceKey,
  NATIVE_TOKEN_SLUG,
} from "core/common";
import { getOnRampCurrencies, getTokenDetailsUrl } from "core/client";

export const getAccountTokensAtom = atomFamily(
  (params: repo.QueryAccountTokensParams) =>
    atomWithRepoQuery((query) => query(() => repo.queryAccountTokens(params))),
  dequal,
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
          createAccountTokenKey({ chainId, accountAddress, tokenSlug }),
        ),
      ),
    ),
  dequal,
);

export const tokenTypeAtom = atomWithStorage<TokenType>(
  "token_type",
  TokenType.Asset,
);

export const getTotalAccountBalanceAtom = atomFamily((accountAddress: string) =>
  atomWithStorage<string | null>(createTotalBalanceKey(accountAddress), null),
);

export const getAllNativeTokensAtom = atomFamily((accountAddress: string) =>
  atomWithRepoQuery((query) =>
    query(() =>
      repo.accountTokens
        .where("[accountAddress+tokenSlug]")
        .equals([accountAddress, NATIVE_TOKEN_SLUG])
        .toArray(),
    ),
  ),
);

export const getTokenDetailsUrlAtom = atomFamily(
  ({ chainId, tokenSlug }: { chainId: number; tokenSlug: string }) =>
    atomWithDefault(() => getTokenDetailsUrl(chainId, tokenSlug)),
  dequal,
);

export const onRampCurrenciesAtom = atomWithDefault(getOnRampCurrencies);
