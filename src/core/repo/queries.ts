import { parseTokenSlug } from "core/common/tokens";
import { AccountToken, TokenStatus, TokenType } from "core/types";

import {
  accountTokens,
  activities,
  contacts,
  permissions,
  tokenActivities,
} from "./helpers";

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

  const baseArgs = [chainId, tokenType, accountAddress] as const;

  if (withDisabled) {
    coll = accountTokens
      .where("[chainId+tokenType+accountAddress]")
      .equals(baseArgs);
  } else {
    coll = accountTokens
      .where("[chainId+tokenType+accountAddress+status+balanceUSD]")
      .between(
        [...baseArgs, TokenStatus.Enabled, 0],
        [...baseArgs, TokenStatus.Native, Infinity],
      );
  }

  coll = coll.reverse();

  if (!withNative) {
    coll = coll.filter((token) => token.status !== TokenStatus.Native);
  }

  if (search) {
    const match = createSearchMatcher(search);

    coll = coll.filter((token) => {
      const { address, id } = parseTokenSlug(token.tokenSlug);

      return token.tokenType === TokenType.Asset
        ? match(address, "strict") || match(token.name) || match(token.symbol)
        : match(`${address}:${id}`, "strict") ||
            match(address, "strict") ||
            match(token.name) ||
            match(token.tokenId) ||
            (token.collectionName ? match(token.collectionName) : false);
    });
  }

  if (offset) {
    coll = coll.offset(offset);
  }

  if (limit) {
    coll = coll.limit(limit);
  }

  return coll.toArray();
}

export type QueryContactsParams = {
  search?: string;
  offset?: number;
  limit?: number;
};

export function queryContacts({ search, offset, limit }: QueryContactsParams) {
  let coll;

  coll = contacts.orderBy("addedAt").reverse();

  if (search) {
    const match = createSearchMatcher(search);

    coll = coll.filter(
      (contact) => match(contact.name) || match(contact.address),
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

export type QueryActivitiesParams = {
  pending: boolean;
  accountAddress: string;
  offset?: number;
  limit?: number;
};

export function queryActivities({
  pending,
  accountAddress,
  offset,
  limit,
}: QueryActivitiesParams) {
  let coll = activities
    .where("[accountAddress+pending]")
    .equals([accountAddress, Number(pending)])
    .reverse();

  if (offset) {
    coll = coll.offset(offset);
  }

  if (limit) {
    coll = coll.limit(limit);
  }

  return coll.toArray();
}

export type QueryTokenActivitiesParams = {
  chainId: number;
  accountAddress: string;
  tokenSlug: string;
  offset?: number;
  limit?: number;
};

export function queryTokenActivities({
  chainId,
  accountAddress,
  tokenSlug,
  offset,
  limit,
}: QueryTokenActivitiesParams) {
  let coll = tokenActivities
    .where("[chainId+accountAddress+tokenSlug]")
    .equals([chainId, accountAddress, tokenSlug])
    .reverse();

  if (offset) {
    coll = coll.offset(offset);
  }

  if (limit) {
    coll = coll.limit(limit);
  }

  return coll.toArray();
}

export type QueryPermissionsParams = {
  search?: string;
  offset?: number;
  limit?: number;
};

export function queryPermissions({
  search,
  offset,
  limit,
}: QueryPermissionsParams) {
  let coll;

  coll = permissions.orderBy("timeAt").reverse();

  if (search) {
    const match = createSearchMatcher(search);

    coll = coll.filter((perm) => match(perm.origin));
  }

  if (offset) {
    coll = coll.offset(offset);
  }

  if (limit) {
    coll = coll.limit(limit);
  }

  return coll.toArray();
}

export function matchNativeToken(token: AccountToken, search: string) {
  const match = createSearchMatcher(search);

  return token.tokenType === TokenType.Asset
    ? match(token.name) || match(token.symbol)
    : false;
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
