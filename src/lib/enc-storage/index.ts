import { Buffer } from "buffer";
import * as Storage from "lib/ext/storage";
import * as Encryptor from "lib/encryptor";

export * from "lib/ext/storage";

export interface Encrypted {
  payload: Encryptor.EncryptedPayload;
  salt: string;
}

export async function fetchAndDecryptOne<T>(
  storageKey: string,
  passKey: CryptoKey
) {
  const encItem = await Storage.fetch<Encrypted>(storageKey);
  return decrypt<T>(encItem, passKey);
}

export async function encryptAndSaveMany(
  items: [string, unknown][],
  passKey: CryptoKey
) {
  const encItems = await Promise.all(
    items.map(async ([storageKey, stuff]) => {
      const encItem = await encrypt(stuff, passKey);
      return [storageKey, encItem] as [typeof storageKey, typeof encItem];
    })
  );

  await Storage.putMany(encItems);
}

async function encrypt(stuff: any, passKey: CryptoKey): Promise<Encrypted> {
  const salt = Encryptor.getRandomBytes();
  const derivedPassKey = await Encryptor.deriveKey(passKey, salt);
  const payload = await Encryptor.encrypt(stuff, derivedPassKey);

  return {
    payload,
    salt: Buffer.from(salt).toString("hex"),
  };
}

async function decrypt<T>(encItem: Encrypted, passKey: CryptoKey) {
  const { salt: saltHex, payload } = encItem;
  const salt = Buffer.from(saltHex, "hex");
  const derivedPassKey = await Encryptor.deriveKey(passKey, salt);
  return Encryptor.decrypt<T>(payload, derivedPassKey);
}
