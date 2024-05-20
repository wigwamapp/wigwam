import { ethers } from "ethers";

const {
  concat,
  toUtf8Bytes,
  encodeBase58,
  dataSlice,
  toBeHex,
  zeroPadValue,
  ripemd160,
  sha256,
} = ethers;

export function getExtendedKey(ledgerPublicKey: string, chainCode: string) {
  const publicKey = compressPublicKey(ledgerPublicKey);
  const fingerprint = getParentFingerprint(publicKey);
  const depth = 0;

  return base58check(
    concat([
      "0x0488B21E",
      toBeHex(depth),
      toBeHex(fingerprint),
      zeroPadValue(toBeHex(0), 4),
      `0x${chainCode}`,
      publicKey,
    ]),
  );
}

export function compressPublicKey(publicKey: string) {
  if (publicKey.startsWith("02") || publicKey.startsWith("03")) {
    return publicKey;
  }

  const yIsEven = parseInt(publicKey.slice(-2), 16) % 2 === 0;

  return `0x${(yIsEven ? "02" : "03") + publicKey.slice(2, 66)}`;
}

export function getParentFingerprint(publicKey: string) {
  const publicKeyHash = toUtf8Bytes(ripemd160(sha256(publicKey)));

  return (
    ((publicKeyHash[0] << 24) |
      (publicKeyHash[1] << 16) |
      (publicKeyHash[2] << 8) |
      publicKeyHash[3]) >>>
    0
  );
}

export function base58check(data: ethers.BytesLike): string {
  return encodeBase58(concat([data, dataSlice(sha256(sha256(data)), 0, 4)]));
}
