import { atomFamily } from "jotai/utils";
import { dequal } from "dequal";
import { atomWithRepoQuery } from "lib/atom-utils";

import * as Repo from "core/repo";
import { TokenType } from "core/types";

export type GetAccountTokensAtomParams = {
  chainId: number;
  tokenType: TokenType;
  accountAddress: string;
  withDisabled?: boolean;
  search?: string;
};

export const getAccountTokensAtom = atomFamily(
  ({
    chainId,
    tokenType,
    accountAddress,
    withDisabled,
    search,
  }: GetAccountTokensAtomParams) =>
    atomWithRepoQuery((query) =>
      query(() => {
        let coll = Repo.accountTokens
          .where("[chainId+tokenType+accountAddress+balanceUSD]")
          .between(
            [chainId, tokenType, accountAddress, withDisabled ? -1 : 0],
            [chainId, tokenType, accountAddress, Infinity]
          )
          .reverse();

        if (search) {
          coll = coll.filter(
            (token) =>
              token.tokenType === TokenType.Asset
                ? token.name.includes(search)
                : true
            // @TODO: Implement valid searching
          );
        }

        return coll.toArray();
      })
    ),
  dequal
);
