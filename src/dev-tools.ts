import { browser } from "webextension-polyfill-ts";

import * as profile from "lib/ext/profile";
import * as storage from "lib/ext/storage";
import * as i18n from "lib/ext/i18n";
import * as enc from "lib/encryptor";
import * as encStorage from "lib/enc-storage";

import * as helpers from "core/helpers";
import * as repo from "core/repo";
import * as client from "core/client";

Object.assign(window, {
  browser,
  profile,
  storage,
  i18n,
  enc,
  encStorage,
  helpers,
  repo,
  client,
});
