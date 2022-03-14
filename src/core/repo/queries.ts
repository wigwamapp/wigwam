import { parseTokenSlug } from "core/common/tokens";
import { TokenStatus, TokenType } from "core/types";

import { accountTokens } from "./helpers";

export type QueryAccountTokensParams = {
  chainId: number;
  tokenType: TokenType;
  accountAddress: string;
  withNative?: boolean;
  withDisabled?: boolean;
  search?: string;
  offset?: number;
  limit?: number;
};

export function queryAccountTokens({
  chainId,
  tokenType,
  accountAddress,
  withNative = true,
  withDisabled,
  search,
  offset,
  limit,
}: QueryAccountTokensParams) {
  let coll;

  const baseArgs: any[] = [chainId, tokenType, accountAddress];

  if (withDisabled) {
    coll = accountTokens
      .where("[chainId+tokenType+accountAddress]")
      .equals(baseArgs);
  } else {
    coll = accountTokens
      .where("[chainId+tokenType+accountAddress+status+balanceUSD]")
      .between(
        [...baseArgs, TokenStatus.Enabled, 0],
        [...baseArgs, TokenStatus.Native, Infinity]
      );
  }

  coll = coll.reverse();

  if (!withNative) {
    coll = coll.filter((token) => token.status !== TokenStatus.Native);
  }

  if (search) {
    const match = createSearchMatcher(search);

    coll = coll.filter((token) =>
      token.tokenType === TokenType.Asset
        ? match(parseTokenSlug(token.tokenSlug).address) ||
          match(token.name) ||
          match(token.symbol)
        : true
    );
  }

  if (offset) {
    coll = coll.offset(offset);
  }

  if (limit) {
    coll = coll.limit(limit);
  }

  return coll.toArray();
}

function createSearchMatcher(search: string) {
  const loweredSearch = search.toLowerCase();

  return (item: string, strict?: "strict") => {
    const loweredItem = item.toLowerCase();

    return strict
      ? loweredItem === loweredSearch
      : loweredItem.includes(loweredSearch);
  };
}
