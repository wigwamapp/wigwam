import { TokenType } from "core/types";

import { accountTokens } from "./helpers";

export type QueryAccountTokensParams = {
  chainId: number;
  tokenType: TokenType;
  accountAddress: string;
  withDisabled?: boolean;
  search?: string;
  offset?: number;
  limit?: number;
};

export function queryAccountTokens({
  chainId,
  tokenType,
  accountAddress,
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
      .where("[chainId+tokenType+accountAddress+disabled]")
      .equals([...baseArgs, 0]);
  }

  coll = coll.reverse();

  if (search) {
    const match = createSearchMatcher(search);

    coll = coll.filter(
      (token) =>
        token.tokenType === TokenType.Asset
          ? match(token.name) || match(token.symbol)
          : true
      // @TODO: Implement valid searching
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

  return (item: string) => item.toLowerCase().includes(loweredSearch);
}
