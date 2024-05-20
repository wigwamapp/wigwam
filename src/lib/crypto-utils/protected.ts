import { getRandomBytes } from "./random";
import {
  zeroBuffer,
  utf8ToBytes,
  bytesToUtf8,
  base64ToBytes,
  bytesToBase64,
} from "./bytes";

export function toProtectedString(entry: string | ArrayBuffer | Uint8Array) {
  let bytes;
  if (typeof entry === "string") {
    bytes = utf8ToBytes(entry);
  } else {
    bytes = new Uint8Array(entry);
  }

  const salt = getRandomBytes(bytes.length);

  for (let i = 0, len = bytes.length; i < len; i++) {
    bytes[i] ^= salt[i];
  }

  const combined = new Uint8Array([...bytes, ...salt]);
  zeroBuffer(bytes);
  zeroBuffer(salt);

  const b64 = bytesToBase64(combined);
  zeroBuffer(combined);

  return b64;
}

export function fromProtectedString(str: string) {
  const combined = base64ToBytes(str);

  const valueByteLength = combined.byteLength / 2;
  const value = combined.slice(0, valueByteLength);
  const salt = combined.slice(valueByteLength, combined.byteLength);

  zeroBuffer(combined);

  const bytes = new Uint8Array(value.byteLength);
  for (let i = bytes.length - 1; i >= 0; i--) {
    bytes[i] = value[i] ^ salt[i];
  }

  zeroBuffer(value);
  zeroBuffer(salt);

  return bytesToUtf8(bytes);
}
