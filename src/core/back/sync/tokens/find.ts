import BigNumber from "bignumber.js";

import {
  AccountToken,
  TokenStandard,
  TokenStatus,
  TokenType,
  NFT,
} from "core/types";
import {
  NATIVE_TOKEN_SLUG,
  createAccountTokenKey,
  parseTokenSlug,
  updateTotalBalance,
} from "core/common";
import * as repo from "core/repo";

import { syncStarted, synced } from "../../state";

import { DexPrices, getDexPrices } from "../dexPrices";
import { getBalanceFromChain, getTokenMetadata } from "../chain";
import { indexerApi } from "../indexer";

const stack = new Set<string>();

export async function addFindTokenRequest(
  chainId: number,
  accountAddress: string,
  tokenSlug: string,
  refreshMetadata = false,
) {
  const dbKey = createAccountTokenKey({
    chainId,
    accountAddress,
    tokenSlug,
  });

  if (stack.has(dbKey)) return;

  stack.add(dbKey);
  syncStarted(accountAddress);

  try {
    await performTokenSync(
      dbKey,
      chainId,
      accountAddress,
      tokenSlug,
      refreshMetadata,
    );
  } catch (err) {
    console.error(err);
  }

  stack.delete(dbKey);
  setTimeout(() => synced(accountAddress), 500);
}

async function performTokenSync(
  dbKey: string,
  chainId: number,
  accountAddress: string,
  tokenSlug: string,
  refreshMetadata = false,
) {
  const { standard, address: tokenAddress } = parseTokenSlug(tokenSlug);

  const existing = await repo.accountTokens.get(dbKey);

  const releaseToRepo = async (
    tokenToAdd: AccountToken,
    prevBalanceUSD = 0,
  ) => {
    await repo.accountTokens.put(
      {
        ...tokenToAdd,
        syncedByChainAt: Date.now(),
        manuallyStatusChanged: true,
      },
      dbKey,
    );

    // Update portfolioUSD
    if (tokenToAdd.tokenType === TokenType.Asset) {
      const nativeTokenDbKey = createAccountTokenKey({
        chainId,
        accountAddress,
        tokenSlug: NATIVE_TOKEN_SLUG,
      });

      const nativeToken =
        tokenToAdd.tokenSlug === NATIVE_TOKEN_SLUG
          ? tokenToAdd
          : await repo.accountTokens.get(nativeTokenDbKey);

      const diff = new BigNumber(tokenToAdd.balanceUSD).minus(prevBalanceUSD);

      if (nativeToken?.portfolioUSD) {
        const portfolioUSD = new BigNumber(nativeToken.portfolioUSD)
          .plus(diff)
          .toString();

        await repo.accountTokens.put(
          { ...nativeToken, portfolioUSD },
          nativeTokenDbKey,
        );
      }

      await updateTotalBalance(accountAddress, (bal) => bal.plus(diff));
    }
  };

  if (existing) {
    const [balance, metadata] = await Promise.all([
      getBalanceFromChain(chainId, tokenSlug, accountAddress),
      refreshMetadata ? getTokenMetadata(chainId, tokenSlug) : null,
    ]);

    const rawBalance = balance?.toString() ?? "0";
    const balanceUSD =
      existing.tokenType === TokenType.Asset &&
      "priceUSD" in existing &&
      existing.priceUSD
        ? new BigNumber(rawBalance)
            .div(new BigNumber(10).pow(existing.decimals))
            .times(existing.priceUSD)
            .toNumber()
        : existing.balanceUSD;

    const balanceChangedToZero =
      existing.status === TokenStatus.Enabled &&
      new BigNumber(existing.rawBalance).gt(0) &&
      new BigNumber(rawBalance).isZero();

    await releaseToRepo(
      {
        ...mergeMetadataSafe(existing, metadata),
        status:
          existing.status === TokenStatus.Disabled && balance
            ? TokenStatus.Enabled
            : balanceChangedToZero && existing.tokenType === TokenType.NFT
              ? TokenStatus.Disabled
              : existing.status,
        rawBalance,
        balanceUSD,
      },
      existing.balanceUSD,
    );

    return;
  }

  if (standard === TokenStandard.Native) return;

  let priceUSD, priceUSDChange: string | undefined;

  if (standard === TokenStandard.ERC20) {
    const coinGeckoPrices = await getDexPrices([tokenAddress], chainId).catch(
      () => ({}) as DexPrices,
    );
    const cgPrice = coinGeckoPrices[tokenAddress];

    priceUSD = cgPrice?.usd?.toString();
    priceUSDChange = cgPrice?.usd_24h_change?.toString();
  }

  const [metadata, balance] = await Promise.all([
    getTokenMetadata(chainId, tokenSlug, true),
    getBalanceFromChain(chainId, tokenSlug, accountAddress),
  ]);

  if (!metadata) return;

  // Logo URL
  if (standard === TokenStandard.ERC20) {
    const res = await indexerApi
      .get("/cmc/v2/cryptocurrency/info", {
        params: { address: tokenAddress },
      })
      .catch(() => null);

    const items = res?.data?.data;
    if (items) {
      const token = items[Object.keys(items)[0]];

      if (token?.logo) {
        Object.assign(metadata, { logoUrl: token.logo });
      }
    }
  }

  const rawBalance = balance?.toString() ?? "0";
  const balanceUSD =
    priceUSD && "decimals" in metadata
      ? new BigNumber(rawBalance)
          .div(new BigNumber(10).pow(Number(metadata.decimals)))
          .times(priceUSD)
          .toNumber()
      : 0;

  const tokenType =
    standard === TokenStandard.ERC20 ||
    ("decimals" in metadata && metadata.decimals > 0)
      ? TokenType.Asset
      : TokenType.NFT;

  const status =
    tokenType === TokenType.Asset || balance
      ? TokenStatus.Enabled
      : TokenStatus.Disabled;

  const tokenToAdd: AccountToken = {
    tokenType,
    status,
    chainId,
    accountAddress,
    tokenSlug,
    // Metadata
    ...(metadata as any),
    // Volumes
    rawBalance,
    balanceUSD,
    priceUSD,
    priceUSDChange,
  };

  await releaseToRepo(tokenToAdd);
}

function mergeMetadataSafe(
  existing: AccountToken,
  metadata:
    | {
        decimals: bigint;
        symbol: string;
        name: string;
      }
    | Partial<NFT>
    | null,
) {
  if (!metadata) return existing;

  const next: AccountToken = { ...existing };

  for (const key of Object.keys(metadata)) {
    const value = (metadata as any)[key];
    if (value || value === 0n) (next as any)[key] = value;
  }

  return next;
}
