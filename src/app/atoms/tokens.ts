import { atom } from "jotai";
import { atomFamily, loadable } from "jotai/utils";
import { dequal } from "dequal";
import {
  atomWithStorage,
  atomWithRepoQuery,
  atomWithAutoReset,
} from "lib/atom-utils";

import * as Repo from "core/repo";
import { getAccounts, onAccountsUpdated } from "core/client";
import { INITIAL_NETWORK } from "fixtures/networks";
import { Account, TokenType } from "core/types";
import { accountAddressAtom } from "./common";

export const getAccountTokensAtom = atomFamily(
  ({ chainId, tokenType }: { chainId: number; tokenType: TokenType }) =>
    atomWithRepoQuery((query, get) => {
      const accountAddress = get(accountAddressAtom);

      // Repo.accountTokens.where("").between([], []).and(() => true).offset(3).toArray();

      return query(() =>
        Repo.accountTokens
          .where("[chainId+accountAddress+tokenType+balanceUSD]")
          .between(
            [chainId, accountAddress, tokenType, ""],
            [chainId, accountAddress, tokenType, "\uffff"]
          )
          .reverse()
          .toArray()
      );
    }),
  dequal
);

// export const getAccountAssetsAtom = atomFamily((chainId: number) =>
// atomWithRepoQuery((query, get) => {
//   const accountTokens = get(getAccountTokensAtom({ chainId:  }))
// })
// )
