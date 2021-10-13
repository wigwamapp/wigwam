import { Buffer } from "buffer";
import * as Storage from "lib/ext/storage";
import { getRandomBytes, deriveKey, decrypt, encrypt } from "lib/crypto-utils";

export * from "lib/ext/storage";

export async function fetchAndDecryptOne<T>(
  storageKey: string,
  cryptoKey: CryptoKey
) {
  const encItem = await Storage.fetch<string>(storageKey);
  return decryptStorageItem<T>(encItem, cryptoKey);
}

export async function encryptAndSaveMany(
  items: [string, unknown][],
  cryptoKey: CryptoKey
) {
  const encItems = await Promise.all(
    items.map(async ([storageKey, data]) => {
      const encItem = await encryptStorageItem(data, cryptoKey);
      return [storageKey, encItem] as [typeof storageKey, typeof encItem];
    })
  );

  await Storage.putMany(encItems);
}

async function encryptStorageItem(
  data: any,
  cryptoKey: CryptoKey
): Promise<string> {
  const salt = getRandomBytes();
  const derivedPassKey = await deriveKey(cryptoKey, salt);
  const { iv, cipher } = await encrypt(data, derivedPassKey);

  return Buffer.concat([salt, iv, cipher]).toString("hex");
}

async function decryptStorageItem<T>(item: string, cryptoKey: CryptoKey) {
  const itemBuf = Buffer.from(item, "hex");

  let index = 0;
  const pick = (length?: number) =>
    itemBuf.slice(index, length && (index += length));

  const salt = pick(32);
  const iv = pick(16);
  const cipher = pick();

  const derivedPassKey = await deriveKey(cryptoKey, salt);
  return decrypt<T>({ iv, cipher }, derivedPassKey);
}
