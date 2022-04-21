import BigNumber from "bignumber.js";
import { IndexableTypeArray } from "dexie";
import axios from "axios";
import { ethers } from "ethers";
import mem from "mem";
import retry from "async-retry";
import { createQueue } from "lib/system/queue";
import { props } from "lib/system/promise";

import { Erc20__factory } from "abi-types";
import {
  Account,
  AccountAsset,
  AccountToken,
  TokenStandard,
  TokenStatus,
  TokenType,
} from "core/types";
import {
  createAccountTokenKey,
  createTokenSlug,
  getNativeTokenLogoUrl,
  NATIVE_TOKEN_SLUG,
  parseTokenSlug,
} from "core/common/tokens";
import { getNetwork } from "core/common/network";
import { requestBalance } from "core/common/balance";
import * as repo from "core/repo";

import { $accounts, syncStarted, synced } from "../state";
import { getRpcProvider } from "../rpc";

const debankApi = axios.create({
  baseURL: "https://openapi.debank.com/v1",
  timeout: 60_000,
});

const enqueueSync = createQueue();

export async function addFindTokenRequest(
  chainId: number,
  accountAddress: string,
  tokenSlug: string
) {
  syncStarted(chainId);

  try {
    await enqueueSync(async () => {
      let tokenToAdd: AccountAsset;

      const debankChain = await getDebankChain(chainId);

      if (debankChain) {
        const { address: tokenAddress } = parseTokenSlug(tokenSlug);

        const [{ data: token }, balance] = await Promise.all([
          debankApi.get("/token", {
            params: {
              chain_id: debankChain.id,
              id: tokenAddress,
            },
          }),
          getBalanceFromChain(chainId, tokenSlug, accountAddress),
        ]);

        const rawBalance = balance?.toString() ?? "0";
        const priceUSD = token.price;
        const balanceUSD = priceUSD
          ? +new BigNumber(rawBalance).div(10 ** token.decimals).times(priceUSD)
          : 0;

        tokenToAdd = {
          tokenType: TokenType.Asset,
          status: TokenStatus.Enabled,
          chainId,
          accountAddress,
          tokenSlug,
          // Metadata
          decimals: token.decimals,
          name: token.name,
          symbol: token.symbol,
          logoUrl: token.logo_url,
          // Volumes
          rawBalance,
          priceUSD,
          balanceUSD,
        };
      } else {
        const token = await getAccountTokenFromChain(
          chainId,
          accountAddress,
          tokenSlug
        );
        if (!token) return;

        const rawBalance = token.balance.toString();

        tokenToAdd = {
          tokenType: TokenType.Asset,
          status: TokenStatus.Enabled,
          chainId,
          accountAddress,
          tokenSlug,
          // Metadata
          decimals: token.decimals,
          name: token.name,
          symbol: token.symbol,
          // Volumes
          rawBalance,
          priceUSD: "0",
          balanceUSD: 0,
        };
      }

      await repo.accountTokens.put(
        tokenToAdd,
        createAccountTokenKey({
          chainId,
          accountAddress,
          tokenSlug,
        })
      );
    });
  } catch (err) {
    console.error(err);
  }

  synced(chainId);
}

export async function addSyncRequest(chainId: number, accountAddress: string) {
  let syncStartedAt: number | undefined;

  setTimeout(() => {
    if (!syncStartedAt) syncStarted(chainId);
    syncStartedAt = Date.now();
  }, 300);

  try {
    await enqueueSync(async () => {
      await syncAccountTokens(chainId, accountAddress);

      const allAccounts = $accounts.getState();

      let currentAccount: Account | undefined;
      const restAccounts: Account[] = [];

      for (const acc of allAccounts) {
        if (acc.address === accountAddress) {
          currentAccount = acc;
        } else {
          restAccounts.push(acc);
        }
      }

      if (!currentAccount) return;

      await syncNativeTokens(
        chainId,
        `current_${accountAddress}`,
        currentAccount
      );

      await syncNativeTokens(
        chainId,
        `rest_${allAccounts.length}`,
        restAccounts
      );
    });
  } catch (err) {
    console.error(err);
  } finally {
    if (syncStartedAt)
      setTimeout(
        () => synced(chainId),
        Math.max(0, syncStartedAt + 1_000 - Date.now())
      );
    else syncStartedAt = 1;
  }
}

const syncNativeTokens = mem(
  async (chainId: number, _buster: string, accounts: Account | Account[]) => {
    if (!Array.isArray(accounts)) {
      accounts = [accounts];
    }

    const dbKeys = accounts.map((acc) =>
      createAccountTokenKey({
        chainId,
        accountAddress: acc.address,
        tokenSlug: NATIVE_TOKEN_SLUG,
      })
    );

    const [{ nativeCurrency, chainTag }, existingTokens, balances, portfolios] =
      await Promise.all([
        getNetwork(chainId),
        repo.accountTokens.bulkGet(dbKeys),
        Promise.all(
          accounts.map((acc) =>
            getBalanceFromChain(chainId, NATIVE_TOKEN_SLUG, acc.address)
          )
        ),
        Promise.all(
          accounts.map((acc) => getDebankUserChainBalance(chainId, acc.address))
        ),
      ]);

    await repo.accountTokens.bulkPut(
      accounts.map((acc, i) => {
        const existing = existingTokens[i] as AccountAsset;
        const balance = balances[i];
        const portfolioUSD =
          existing?.portfolioUSD === "-1" && !portfolios[i]
            ? "0"
            : portfolios[i] ?? existing?.portfolioUSD;

        if (existing) {
          if (!balance) {
            return {
              ...existing,
              portfolioUSD,
            };
          }

          const rawBalance = balance.toString();
          const balanceUSD = existing.priceUSD
            ? +new BigNumber(rawBalance)
                .div(10 ** nativeCurrency.decimals)
                .times(existing.priceUSD)
            : existing.balanceUSD;

          return {
            ...existing,
            rawBalance,
            balanceUSD,
            portfolioUSD,
          };
        } else {
          return {
            chainId,
            accountAddress: acc.address,
            tokenType: TokenType.Asset,
            status: TokenStatus.Native,
            tokenSlug: NATIVE_TOKEN_SLUG,
            decimals: nativeCurrency.decimals,
            name: nativeCurrency.name,
            symbol: nativeCurrency.symbol,
            logoUrl: getNativeTokenLogoUrl(chainTag),
            rawBalance: balance?.toString() ?? "0",
            balanceUSD: 0,
            portfolioUSD,
          };
        }
      }),
      dbKeys
    );
  },
  {
    cacheKey: ([chainId, buster]) => `${chainId}${buster}`,
    maxAge: 20_000, // 20 sec
  }
);

const syncAccountTokens = mem(
  async (chainId: number, accountAddress: string) => {
    const [debankChain, existingAccTokens, { nativeCurrency, chainTag }] =
      await Promise.all([
        getDebankChain(chainId),
        repo.accountTokens
          .where("[chainId+tokenType+accountAddress]")
          .equals([chainId, TokenType.Asset, accountAddress])
          .toArray(),
        getNetwork(chainId),
      ]);

    const accTokens: AccountToken[] = [];
    const dbKeys: IndexableTypeArray = [];

    let existingTokensMap: Map<string, AccountToken> | undefined;

    if (debankChain) {
      existingTokensMap = new Map(
        existingAccTokens.map((t) => [t.tokenSlug, t])
      );

      const { data: debankUserTokens } = await debankApi.get(
        "/user/token_list",
        {
          params: {
            id: getMyRandomAddress(accountAddress),
            chain_id: debankChain.id,
            is_all: false,
          },
        }
      );

      for (const token of debankUserTokens) {
        const rawBalanceBN = ethers.BigNumber.from(token.raw_amount_hex_str);

        const native = token.id === debankChain.native_token_id;
        const tokenSlug = createTokenSlug({
          standard: native ? TokenStandard.Native : TokenStandard.ERC20,
          address: native ? "0" : token.id,
          id: "0",
        });

        const existing = existingTokensMap.get(tokenSlug) as AccountAsset;

        if (!existing && rawBalanceBN.isZero()) {
          continue;
        }

        const metadata = native
          ? {
              symbol: nativeCurrency.symbol,
              name: nativeCurrency.name,
              logoUrl: getNativeTokenLogoUrl(chainTag),
            }
          : {
              symbol: token.symbol,
              name: token.name,
              logoUrl: token.logo_url,
            };

        const rawBalance = rawBalanceBN.toString();
        const priceUSD = token.price;
        const balanceUSD = priceUSD
          ? +new BigNumber(rawBalance).div(10 ** token.decimals).times(priceUSD)
          : 0;

        accTokens.push(
          existing
            ? {
                ...existing,
                ...metadata,
                rawBalance,
                balanceUSD,
                priceUSD,
              }
            : {
                chainId,
                accountAddress,
                tokenSlug,
                tokenType: TokenType.Asset,
                status: native ? TokenStatus.Native : TokenStatus.Enabled,
                // Metadata
                decimals: native ? nativeCurrency.decimals : token.decimals,
                ...metadata,
                // Volumes
                rawBalance,
                balanceUSD,
                priceUSD,
                portfolioUSD: native ? "-1" : undefined,
              }
        );

        dbKeys.push(
          createAccountTokenKey({
            chainId,
            accountAddress,
            tokenSlug,
          })
        );

        existingTokensMap.delete(tokenSlug);
      }
    }

    const restTokens = existingTokensMap
      ? Array.from(existingTokensMap.values())
      : existingAccTokens;

    if (restTokens.length > 0) {
      const balances = await Promise.all(
        restTokens.map(({ tokenSlug }) =>
          tokenSlug !== NATIVE_TOKEN_SLUG
            ? getBalanceFromChain(chainId, tokenSlug, accountAddress)
            : null
        )
      );

      for (let i = 0; i < restTokens.length; i++) {
        const balance = balances[i];

        if (!balance) continue;

        const token = restTokens[i] as AccountAsset;

        const rawBalance = balance.toString();
        const balanceUSD = token.priceUSD
          ? +new BigNumber(rawBalance)
              .div(10 ** token.decimals)
              .times(token.priceUSD)
          : token.balanceUSD;

        accTokens.push({
          ...token,
          rawBalance,
          balanceUSD,
        });

        dbKeys.push(
          createAccountTokenKey({
            chainId,
            accountAddress,
            tokenSlug: token.tokenSlug,
          })
        );
      }
    }

    await repo.accountTokens.bulkPut(accTokens, dbKeys);
  },
  {
    cacheKey: (args) => args.join("_"),
    maxAge: 40_000, // 40 sec
  }
);

const getDebankUserChainBalance = mem(
  async (chainId: number, accountAddress: string) => {
    try {
      const debankChain = await getDebankChain(chainId);
      if (!debankChain) return null;

      const { data } = await debankApi.get("/user/chain_balance", {
        params: {
          chain_id: debankChain.id,
          id: getMyRandomAddress(accountAddress),
        },
      });

      return data.usd_value.toString() as string;
    } catch (err) {
      console.error(err);
      return null;
    }
  },
  {
    cacheKey: (args) => args.join("_"),
    maxAge: 60_000, // 60 sec
  }
);

const getAccountTokenFromChain = async (
  chainId: number,
  accountAddress: string,
  tokenSlug: string
) => {
  const provider = getRpcProvider(chainId);

  const { address: tokenAddress } = parseTokenSlug(tokenSlug);
  const contract = Erc20__factory.connect(tokenAddress, provider);

  try {
    return await retry(
      () =>
        props({
          decimals: contract.decimals(),
          symbol: contract.symbol(),
          name: contract.name(),
          balance: contract.balanceOf(accountAddress),
        }),
      { retries: 3 }
    );
  } catch (err) {
    console.error(err);
    return null;
  }
};

const getBalanceFromChain = mem(
  async (chainId: number, tokenSlug: string, accountAddress: string) => {
    const provider = getRpcProvider(chainId);

    return requestBalance(
      provider,
      tokenSlug,
      getMyRandomAddress(accountAddress)
    ).catch(() => null);
  },
  {
    cacheKey: (args) => args.join("_"),
    maxAge: 3_000,
  }
);

const getDebankChain = mem(async (chainId: number) => {
  const chainList = await getDebankChainList();
  return chainList.find((c: any) => c.community_id === chainId);
});

const getDebankChainList = mem(
  async () => {
    const { data } = await debankApi.get("/chain/list");
    return data;
  },
  {
    maxAge: 60 * 60_000, // 1 hour
  }
);

function getMyRandomAddress(accountAddress: string, hops = 0): string {
  if (process.env.VIGVAM_DEV_RANDOM_ADDRESSES === "false") {
    return accountAddress;
  }

  const storageKey = `__random_address_${accountAddress}`;
  const stored = localStorage.getItem(storageKey);

  if (stored) {
    return stored;
  }

  const addresses = [
    "0xbdfa4f4492dd7b7cf211209c4791af8d52bf5c50",
    "0x9c5083dd4838e120dbeac44c052179692aa5dac5",
    "0xc1e42f862d202b4a0ed552c1145735ee088f6ccf",
    "0x50664ede715e131f584d3e7eaabd7818bb20a068",
    "0x3ec6732676db7996c1b34e64b0503f941025cb63",
    "0x1d5e65a087ebc3d03a294412e46ce5d6882969f4",
    "0x69bab6810fa99475854bca0a3dd72ae6a0728ece",
    "0xdb9d281c3d29baa9587f5dac99dd982156913913",
    "0x108a8b7200d044bbbe95bef6f671baec5473e05f",
    "0x0b5a91adc9a867501fd814cea2caba28f9770b63",
    "0xab5801a7d398351b8be11c439e05c5b3259aec9b",
  ];
  const randomIndex = Math.floor(Math.random() * addresses.length);
  const randomAddress = addresses[randomIndex];

  if (randomAddress in localStorage) {
    if (hops > 10) return accountAddress;
    return getMyRandomAddress(accountAddress, hops + 1);
  }

  localStorage.setItem(storageKey, randomAddress);
  localStorage.setItem(randomAddress, accountAddress);

  return randomAddress;
}
