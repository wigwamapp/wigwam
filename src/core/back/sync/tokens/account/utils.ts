import { IndexableTypeArray } from "dexie";

import * as repo from "core/repo";
import { AccountNFT, AccountToken, TokenType } from "core/types";
import { NATIVE_TOKEN_SLUG, createAccountTokenKey } from "core/common/tokens";

export async function prepareAccountTokensSync<T extends AccountToken>(
  chainId: number,
  accountAddress: string,
  tokenType: TokenType,
) {
  const existingAccTokensPure = (await repo.accountTokens
    .where("[chainId+tokenType+accountAddress]")
    .equals([chainId, tokenType, accountAddress])
    .toArray()) as T[];

  let existingAccTokens: T[];

  if (tokenType === TokenType.NFT) {
    existingAccTokens = [];
    const dbKeysToDelete: string[] = [];

    for (const token of existingAccTokensPure as AccountNFT[]) {
      if (token.tokenId.includes("e+")) {
        dbKeysToDelete.push(createAccountTokenKey(token));
      } else {
        existingAccTokens.push(token as T);
      }
    }

    if (dbKeysToDelete.length > 0) {
      await repo.accountTokens.bulkDelete(dbKeysToDelete).catch(console.error);
    }
  } else {
    existingAccTokens = existingAccTokensPure;
  }

  const existingTokensMap = new Map(
    existingAccTokens
      .filter((t) => t.tokenSlug !== NATIVE_TOKEN_SLUG)
      .map((t) => [t.tokenSlug, t]),
  );

  const accTokens: AccountToken[] = [];
  const dbKeys: IndexableTypeArray = [];

  const addToken = (token: T) => {
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
    existingAccTokens,
    existingTokensMap,
    addToken,
    accTokens,
    releaseToRepo,
  };
}
