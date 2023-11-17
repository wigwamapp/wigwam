import { IndexableTypeArray } from "dexie";

import * as repo from "core/repo";
import { AccountToken, TokenType } from "core/types";
import { createAccountTokenKey } from "core/common/tokens";
import { getNetwork } from "core/common/network";

import { fetchCxAccountTokens } from "../../indexer";

export async function prepareAccountTokensSync(
  chainId: number,
  accountAddress: string,
  tokenType: TokenType,
) {
  const [network, cxAccountTokens, existingAccTokens] = await Promise.all([
    getNetwork(chainId),
    fetchCxAccountTokens(chainId, accountAddress, tokenType).catch((err) => {
      console.error(err);
      return [];
    }),
    repo.accountTokens
      .where("[chainId+tokenType+accountAddress]")
      .equals([chainId, tokenType, accountAddress])
      .toArray(),
  ]);

  const existingTokensMap = new Map(
    existingAccTokens.map((t) => [t.tokenSlug, t]),
  );

  const accTokens: AccountToken[] = [];
  const dbKeys: IndexableTypeArray = [];

  const addToken = (token: AccountToken) => {
    accTokens.push(token);

    dbKeys.push(
      createAccountTokenKey({
        chainId,
        accountAddress,
        tokenSlug: token.tokenSlug,
      }),
    );

    existingTokensMap.delete(token.tokenSlug);
  };

  const releaseToRepo = () => repo.accountTokens.bulkPut(accTokens, dbKeys);

  return {
    network,
    cxAccountTokens,
    existingAccTokens,
    existingTokensMap,
    addToken,
    accTokens,
    releaseToRepo,
  };
}
