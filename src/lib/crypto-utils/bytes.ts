const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

export function bytesToUtf8(arr: Uint8Array): string {
  return textDecoder.decode(arr);
}

export function utf8ToBytes(str: string): Uint8Array {
  return textEncoder.encode(str);
}

export function bytesToBase64(arr: Uint8Array): string {
  let str = "";
  for (let i = 0; i < arr.length; i++) {
    str += String.fromCharCode(arr[i]);
  }

  return btoa(str);
}

export function base64ToBytes(str: string): Uint8Array {
  const byteStr = atob(str);

  const arr = new Uint8Array(byteStr.length);
  for (let i = 0; i < byteStr.length; i++) {
    arr[i] = byteStr.charCodeAt(i);
  }

  return arr;
}

export function zeroBuffer(arr: Uint8Array | ArrayBuffer) {
  const intArr = arr instanceof ArrayBuffer ? new Uint8Array(arr) : arr;
  intArr.fill(0);
}
