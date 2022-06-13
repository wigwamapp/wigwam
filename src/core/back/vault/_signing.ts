import {
  // bufferToHex,
  ecsign,
  hashPersonalMessage,
  // publicToAddress,
  toBuffer,
  addHexPrefix,
  bufferToInt,
  // ecrecover,
  // fromRpcSig,
  fromSigned,
  toUnsigned,
} from "ethereumjs-util";
import { ethers } from "ethers";
import { ProtectedValue } from "kdbxweb";

export function personalSign({
  privateKey,
  data,
  chainId,
}: {
  privateKey: ProtectedValue;
  data: unknown;
  chainId?: number | undefined;
}): string {
  if (isNullish(data)) {
    throw new Error("Missing data parameter");
  } else if (isNullish(privateKey)) {
    throw new Error("Missing privateKey parameter");
  }

  const message = legacyToBuffer(data);
  const msgHash = hashPersonalMessage(message);
  const sig = ecsign(msgHash, Buffer.from(privateKey.getText()), chainId);
  const serialized = concatSig(toBuffer(sig.v), sig.r, sig.s);
  return serialized;
}

function concatSig(v: Buffer, r: Buffer, s: Buffer): string {
  const rSig = fromSigned(r);
  const sSig = fromSigned(s);
  const vSig = bufferToInt(v);
  const rStr = padWithZeroes(toUnsigned(rSig).toString("hex"), 64);
  const sStr = padWithZeroes(toUnsigned(sSig).toString("hex"), 64);
  const vStr = stripHexPrefix(intToHex(vSig));

  return addHexPrefix(rStr.concat(sStr, vStr));
}

function padWithZeroes(hexString: string, targetLength: number): string {
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

function legacyToBuffer(value: unknown) {
  return typeof value === "string" && !ethers.utils.isHexString(value)
    ? Buffer.from(value)
    : toBuffer(value as any);
}

function isNullish(value: any) {
  return value === null || value === undefined;
}

function stripHexPrefix(str: any) {
  if (typeof str !== "string") {
    return str;
  }

  return str.startsWith("0x") ? str.slice(2) : str;
}

function intToHex(i: number) {
  return `0x${i.toString(16)}`;
}
