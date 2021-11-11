import browser, { Storage } from "webextension-polyfill";
import { utils } from "ethers";
import { Buffer } from "buffer";

import { createQueue } from "lib/system/queue";

import { underProfile } from "./profile";

export type Items = { [key: string]: unknown } | [string, unknown][];

export const transact = createQueue();

export async function isStored(key: string) {
  const val = await fetchForce(key);
  return val !== undefined;
}

export async function fetch<T = any>(key: string) {
  const value = await fetchForce<T>(key);
  if (value !== undefined) {
    return value;
  } else {
    throw new Error("Some storage item not found");
  }
}

export async function fetchForce<T = any>(key: string): Promise<T | undefined> {
  key = wrapKey(key);
  const items = await browser.storage.local.get([key]);
  return items[key];
}

export async function fetchMany(keys: string[]) {
  return browser.storage.local.get(keys.map(wrapKey));
}

export function put<T>(key: string, value: T) {
  return putMany([[key, value]]);
}

export function putMany(items: Items) {
  if (!Array.isArray(items)) {
    items = Object.entries(items);
  }
  items = Object.fromEntries(items.map(([k, v]) => [wrapKey(k), v]));
  return browser.storage.local.set(items);
}

export function remove(keys: string | string[]) {
  keys = Array.isArray(keys) ? keys.map(wrapKey) : wrapKey(keys);
  return browser.storage.local.remove(keys);
}

export function clear() {
  return browser.storage.local.clear();
}

export function subscribe<T = any>(
  key: string,
  callback: (change: { newValue?: T; oldValue?: T }) => void
) {
  key = wrapKey(key);
  const listener = (
    changes: { [s: string]: Storage.StorageChange },
    areaName: string
  ) => {
    if (areaName === "local" && key in changes) {
      callback(changes[key]);
    }
  };

  browser.storage.onChanged.addListener(listener);
  return () => browser.storage.onChanged.removeListener(listener);
}

function wrapKey(key: string) {
  key = underProfile(key);
  return utils.sha256(Buffer.from(key, "utf8")).slice(2);
}
