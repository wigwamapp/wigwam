import browser from "webextension-polyfill";
import BigNumber from "bignumber.js";
import { ethers } from "ethers";
import { Buffer } from "buffer";

import * as profile from "lib/ext/profile";
import * as global from "lib/ext/global";
import * as i18n from "lib/ext/i18n";
import { storage } from "lib/ext/storage";
import * as cryptoUtils from "lib/crypto-utils";

import * as types from "core/types";
import * as common from "core/common";
import * as repo from "core/repo";
import * as client from "core/client";
import { AccountToken, TokenStandard, TokenType } from "core/types";
import { IndexableTypeArray } from "dexie";
import { createTokenSlug } from "core/common/tokens";

Object.assign(window, {
  ...cryptoUtils,
  browser,
  ethers,
  Buffer,
  profile,
  storage,
  global,
  i18n,
  types,
  common,
  repo,
  client,
  reset,
  getAllStorage,
  BigNumber,
  fakeAccountTokens,
});

async function reset() {
  global.clear();
  await storage.clear();
  await repo.clear();
  browser.runtime.reload();
}

function getAllStorage() {
  return browser.storage.local.get();
}

async function fakeAccountTokens(accountAddress: string) {
  if (!accountAddress) return;

  const data = await fetch(
    "https://openapi.debank.com/v1/user/token_list?id=0xd61f95aa7a1777c737c3105d3a8991611ddc3b15&chain_id=bsc&is_all=false"
  ).then((r) => r.json());

  const chainId = 1;
  const tokenType = TokenType.Asset;

  const accTokens: AccountToken[] = [];
  const dbKeys: IndexableTypeArray = [];

  for (const token of data) {
    const tokenSlug = createTokenSlug({
      standard: TokenStandard.ERC20,
      address: token.id,
      id: "0",
    });

    const rawBalance = ethers.BigNumber.from(
      token.raw_amount_hex_str
    ).toString();

    const balanceUSD =
      rawBalance !== "0"
        ? token.price &&
          +new BigNumber(rawBalance)
            .div(10 ** token.decimals)
            .times(token.price)
            .toFormat(2, BigNumber.ROUND_DOWN)
        : -1;

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
    });

    dbKeys.push([chainId, accountAddress, tokenSlug].join("_"));
  }

  await repo.accountTokens.bulkPut(accTokens, dbKeys);
}
