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
import { getRandomName } from "lib/random-name";

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
  generateRandomContacts,
});

async function generateRandomContacts() {
  const contractsToAdd: any[] = [];

  const seedPhrase = ethers.Wallet.createRandom().mnemonic.phrase;
  const hdNode = ethers.utils.HDNode.fromMnemonic(seedPhrase);

  for (let i = 0; i < 99; i++) {
    const { address } = hdNode.derivePath(`m/44'/60'/0'/0/${i}`);
    const name = getRandomName();
    const addedAt = new Date().getTime();

    contractsToAdd.push({ address, name, addedAt });
  }

  await repo.contacts.bulkPut(contractsToAdd);
}

if (process.env.RELEASE_ENV === "false") {
  const imports = [
    import("./importExport"),
    process.env.VIGVAM_DEV_CONTROL_PANEL === "true" && import("./controlPanel"),
  ].filter(Boolean);

  Promise.all(imports)
    .then((modules) => modules.forEach((m) => m && Object.assign(window, m)))
    .catch(console.error);
}
