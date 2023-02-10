import browser from "webextension-polyfill";

import { storage } from "lib/ext/storage";

import * as repo from "core/repo";

export async function reset() {
  try {
    localStorage.clear();
  } catch {}

  await storage.clear();
  await repo.clear();
  browser.runtime.reload();
}

export function getAllStorage() {
  return browser.storage.local.get();
}
