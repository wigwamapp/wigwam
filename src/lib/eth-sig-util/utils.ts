import { Buffer } from "buffer";
import {
  toBuffer,
  addHexPrefix,
  bufferToInt,
  fromSigned,
  toUnsigned,
  ecrecover,
  fromRpcSig,
  isHexString,
} from "@ethereumjs/util";
import { keccak256 } from "ethereum-cryptography/keccak";
import { utf8ToBytes } from "ethereum-cryptography/utils";

export function recoverPublicKey(
  messageHash: Buffer,
  signature: string
): Buffer {
  const sigParams = fromRpcSig(signature);
  return ecrecover(messageHash, sigParams.v, sigParams.r, sigParams.s);
}

export function concatSig(v: Buffer, r: Buffer, s: Buffer): string {
  const rSig = fromSigned(r);
  const sSig = fromSigned(s);
  const vSig = bufferToInt(v);
  const rStr = padWithZeroes(toUnsigned(rSig).toString("hex"), 64);
  const sStr = padWithZeroes(toUnsigned(sSig).toString("hex"), 64);
  const vStr = stripHexPrefix(intToHex(vSig));

  return addHexPrefix(rStr.concat(sStr, vStr));
}

export function padWithZeroes(hexString: string, targetLength: number): string {
  if (hexString !== "" && !/^[a-f0-9]+$/iu.test(hexString)) {
    throw new Error(
      `Expected an unprefixed hex string. Received: ${hexString}`
    );
  }

  if (targetLength < 0) {
    throw new Error(
      `Expected a non-negative integer target length. Received: ${targetLength}`
    );
  }

  return String.prototype.padStart.call(hexString, targetLength, "0");
}

export function legacyKeccak(value: any) {
  if (typeof value === "string" && !isHexString(value)) {
    value = utf8ToBytes(value);
  } else {
    value = toBuffer(value);
  }

  return Buffer.from(keccak256(value));
}

export function legacyToBuffer(value: unknown) {
  return typeof value === "string" && !isHexString(value)
    ? Buffer.from(value)
    : toBuffer(value as any);
}

export function isNullish(value: any) {
  return value === null || value === undefined;
}

export function stripHexPrefix(str: any) {
  if (typeof str !== "string") {
    return str;
  }

  return str.startsWith("0x") ? str.slice(2) : str;
}

export function intToHex(i: number) {
  return `0x${i.toString(16)}`;
}
