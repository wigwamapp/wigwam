import browser from "webextension-polyfill";
import { ethers } from "ethers";

import * as profile from "lib/ext/profile";
import * as storage from "lib/ext/storage";
import * as global from "lib/ext/global";
import * as i18n from "lib/ext/i18n";
import * as enc from "lib/encryptor";
import * as encStorage from "lib/enc-storage";

import * as common from "core/common";
import * as repo from "core/repo";
import * as client from "core/client";

Object.assign(window, {
  browser,
  ethers,
  profile,
  storage,
  global,
  i18n,
  enc,
  encStorage,
  common,
  repo,
  client,
  reset,
});

async function reset() {
  global.clear();
  await browser.storage.local.clear();
  await repo.clear();
  browser.runtime.reload();
}
