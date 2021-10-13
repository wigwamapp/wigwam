import { Buffer } from "buffer";

import { getRandomBytes } from "./random";

export type EncryptedPayload = { iv: Uint8Array; cipher: Uint8Array };

export async function encrypt(
  data: any,
  key: CryptoKey
): Promise<EncryptedPayload> {
  const iv = getRandomBytes(16);
  const cipher = Buffer.from(
    await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv,
      },
      key,
      Buffer.from(JSON.stringify(data))
    )
  );

  return { iv, cipher };
}

export async function decrypt<T = any>(
  { iv, cipher }: EncryptedPayload,
  key: CryptoKey
): Promise<T> {
  const dataBuf = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    cipher
  );
  return JSON.parse(Buffer.from(dataBuf).toString());
}

export async function getCryptoKey(keyDataHex: string) {
  return crypto.subtle.importKey(
    "raw",
    Buffer.from(keyDataHex, "hex"),
    "PBKDF2",
    false,
    ["deriveBits", "deriveKey"]
  );
}

export function deriveKey(key: CryptoKey, salt: Uint8Array) {
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 120_000,
      hash: "SHA-512",
    },
    key,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}
