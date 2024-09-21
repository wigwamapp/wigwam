import browser, { Storage } from "webextension-polyfill";
import { ethers } from "ethers";
import { utf8ToBytes } from "lib/crypto-utils/bytes";

export type StorageItems = { [key: string]: unknown } | [string, unknown][];

export type StorageAreaOptions = Partial<{
  keyMapper: (key: string) => string | Promise<string>;
  obfuscate: boolean;
}>;

/**
 * The `StorageArea` class is a wrapper over browser storage areas.
 * It allows to customize the storage keys with async formatter + obfuscate them
 */
export class StorageArea {
  constructor(
    private name: string,
    private opts: StorageAreaOptions = {},
  ) {}

  private get area(): Storage.StorageArea {
    return (browser.storage as any)[this.name];
  }

  async isStored(key: string) {
    const val = await this.fetchForce(key);
    return val !== undefined;
  }

  async fetch<T = any>(key: string) {
    const value = await this.fetchForce<T>(key);
    if (value !== undefined) {
      return value;
    } else {
      throw new Error("Some storage item not found");
    }
  }

  async fetchForce<T = any>(key: string): Promise<T | undefined> {
    key = await this.wrapKeys(key);

    const items = await this.area.get([key]);
    return items[key] as T;
  }

  async fetchMany<T = any>(keys: string[]) {
    keys = await this.wrapKeys(keys);

    const items = await this.area.get(keys);
    return keys.map((k) => items[k] as T | undefined);
  }

  async put<T>(key: string, value: T) {
    key = await this.wrapKeys(key);

    return this.area.set({ [key]: value });
  }

  async putMany(items: StorageItems) {
    if (!Array.isArray(items)) {
      items = Object.entries(items);
    }

    items = Object.fromEntries(
      await Promise.all(
        items.map(async ([k, v]) => [await this.wrapKeys(k), v]),
      ),
    );

    return this.area.set(items as any);
  }

  async remove(keys: string | string[]) {
    keys = await this.wrapKeys(keys);

    return this.area.remove(keys);
  }

  clear() {
    return this.area.clear();
  }

  subscribe<T = any>(
    key: string,
    callback: (change: { newValue?: T; oldValue?: T }) => void,
  ) {
    let listener: (
      changes: { [s: string]: Storage.StorageChange },
      areaName: string,
    ) => void;

    this.wrapKeys(key)
      .then((finalKey) => {
        listener = (changes, areaName) => {
          if (areaName === this.name && finalKey in changes) {
            callback(changes[finalKey] as { newValue?: T; oldValue?: T });
          }
        };

        browser.storage.onChanged.addListener(listener);
      })
      .catch(console.error);

    return () => listener && browser.storage.onChanged.removeListener(listener);
  }

  private async wrapKeys<T extends string[] | string>(keys: T): Promise<T> {
    return (
      Array.isArray(keys)
        ? Promise.all(keys.map((k) => this.wrapOneKey(k)))
        : this.wrapOneKey(keys)
    ) as Promise<T>;
  }

  private async wrapOneKey(key: string) {
    // Wrap with provided key mapper
    key = this.opts.keyMapper ? await this.opts.keyMapper(key) : key;
    // Obfuscate with hashing
    key =
      this.opts.obfuscate !== false
        ? ethers.ripemd160(utf8ToBytes(key)).slice(2)
        : key;

    return key;
  }
}
