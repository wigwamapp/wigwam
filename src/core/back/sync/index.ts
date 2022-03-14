import BigNumber from "bignumber.js";
import { IndexableTypeArray } from "dexie";
import axios from "axios";
import { ethers } from "ethers";
import mem from "mem";
import { match } from "ts-pattern";
import { assert } from "lib/system/assert";

import {
  AccountToken,
  TokenStandard,
  TokenStatus,
  TokenType,
} from "core/types";
import { createAccountTokenKey, createTokenSlug } from "core/common/tokens";
import * as repo from "core/repo";

import { $accounts, syncStarted, synced } from "../state";

const debankApi = axios.create({
  baseURL: "https://openapi.debank.com/v1",
  timeout: 60_000,
});

export type AddSyncRequestParams = {
  chainId: number;
  accountUuid: string;
};

export async function addSyncRequest({
  chainId,
  accountUuid,
}: AddSyncRequestParams) {
  const allAccounts = $accounts.getState();
  const account = allAccounts.find((acc) => acc.uuid === accountUuid);
  assert(account, "Account not found");

  syncAccountTokens(chainId, account.address);
}

const syncAccountTokens = mem(
  async (chainId: number, accountAddress) => {
    syncStarted(chainId);

    try {
      const debankChain = await getDebankChain(chainId);
      if (!debankChain) return;

      const { data } = await debankApi.get("/user/token_list", {
        params: {
          id: getMyRandomAddress(accountAddress),
          chain_id: debankChain.id,
          is_all: false,
        },
      });

      const tokenType = TokenType.Asset;

      const accTokens: AccountToken[] = [];
      const dbKeys: IndexableTypeArray = [];

      for (const token of data) {
        const native = token.id === debankChain.native_token_id;

        const tokenSlug = createTokenSlug({
          standard: native ? TokenStandard.Native : TokenStandard.ERC20,
          address: native ? "0" : token.id,
          id: "0",
        });

        const rawBalance = ethers.BigNumber.from(
          token.raw_amount_hex_str
        ).toString();

        const status = match(true)
          .with(
            token.id === debankChain.native_token_id,
            () => TokenStatus.Native
          )
          .with(rawBalance === "0", () => TokenStatus.Disabled)
          .otherwise(() => TokenStatus.Enabled);

        const balanceUSD = token.price
          ? +new BigNumber(rawBalance)
              .div(10 ** token.decimals)
              .times(token.price)
              .toFixed(2, 1)
          : 0;

        const dbKey = createAccountTokenKey({
          chainId,
          accountAddress,
          tokenSlug,
        });

        accTokens.push({
          chainId,
          accountAddress,
          tokenSlug,
          tokenType,
          decimals: token.decimals,
          name: token.name,
          symbol: token.symbol,
          logoUrl: token.logo_url,
          rawBalance,
          balanceUSD,
          priceUSD: token.price,
          status,
        });

        dbKeys.push(dbKey);
      }

      await repo.accountTokens.bulkPut(accTokens, dbKeys);
    } catch (err) {
      console.error(err);
    }

    synced(chainId);
  },
  {
    cacheKey: (args) => args.join("_"),
    maxAge: 60_000, // 60 sec
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

function getMyRandomAddress(accountAddress: string) {
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
  ];
  const randomIndex = Math.floor(Math.random() * addresses.length);
  const randomAddress = addresses[randomIndex];

  localStorage.setItem(storageKey, randomAddress);

  return randomAddress;
}
