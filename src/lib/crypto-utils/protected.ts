import { getRandomBytes } from "./random";

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

export function toProtectedString(str: string) {
  const bytes = textEncoder.encode(str);
  const salt = getRandomBytes(bytes.length);

  for (let i = 0, len = bytes.length; i < len; i++) {
    bytes[i] ^= salt[i];
  }

  const combined = new Uint8Array([...bytes, ...salt]);
  zeroBuffer(bytes);
  zeroBuffer(salt);

  str = bytesToBase64(combined);
  zeroBuffer(combined);

  return str;
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

  return textDecoder.decode(bytes);
}

function bytesToBase64(arr: Uint8Array): string {
  let str = "";
  for (let i = 0; i < arr.length; i++) {
    str += String.fromCharCode(arr[i]);
  }

  return btoa(str);
}

function base64ToBytes(str: string): Uint8Array {
  const byteStr = atob(str);

  const arr = new Uint8Array(byteStr.length);
  for (let i = 0; i < byteStr.length; i++) {
    arr[i] = byteStr.charCodeAt(i);
  }

  return arr;
}

function zeroBuffer(arr: Uint8Array) {
  arr.fill(0);
}
