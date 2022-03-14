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
