import browser from "webextension-polyfill";

import * as global from "lib/ext/global";
import { storage } from "lib/ext/storage";

import * as repo from "core/repo";

export async function reset() {
  global.clear();
  await storage.clear();
  await repo.clear();
  browser.runtime.reload();
}

export function getAllStorage() {
  return browser.storage.local.get();
}
