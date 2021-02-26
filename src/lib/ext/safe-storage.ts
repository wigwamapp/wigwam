import { browser } from "webextension-polyfill-ts";
import { createQueue } from "lib/system/queue";

export type Items = { [key: string]: unknown } | [string, unknown][];

export const transact = createQueue();

export async function isStored(key: string) {
  const items = await browser.storage.local.get([key]);
  return key in items && items[key] !== undefined;
}

export async function fetchOne<T = any>(key: string) {
  const items = await browser.storage.local.get([key]);
  if (key in items && items[key] !== undefined) {
    return items[key] as T;
  } else {
    throw new Error("Some storage item not found");
  }
}

export function putOne<T>(key: string, value: T) {
  return putMany([[key, value]]);
}

export function putMany(items: Items) {
  if (Array.isArray(items)) {
    items = Object.fromEntries(items);
  }
  return browser.storage.local.set(items);
}

export function remove(keys: string | string[]) {
  return browser.storage.local.remove(keys);
}

export function clear() {
  return browser.storage.local.clear();
}
