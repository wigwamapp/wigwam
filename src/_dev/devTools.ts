import browser from "webextension-polyfill";
import BigNumber from "bignumber.js";
import { ethers } from "ethers";
import { Buffer } from "buffer";

import * as profile from "lib/ext/profile";
import * as global from "lib/ext/global";
import * as i18n from "lib/ext/i18n";
import { storage } from "lib/ext/storage";
import * as cryptoUtils from "lib/crypto-utils";
import { downloadFile } from "lib/download";

import * as types from "core/types";
import * as common from "core/common";
import * as repo from "core/repo";
import * as client from "core/client";

import { reset, getAllStorage } from "./utils";

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
  downloadFile,
});

if (process.env.RELEASE_ENV === "false") {
  const imports = [import("./importExport"), import("./controlPanel")];

  Promise.all(imports)
    .then((modules) => modules.forEach((m) => m && Object.assign(window, m)))
    .catch(console.error);
}
