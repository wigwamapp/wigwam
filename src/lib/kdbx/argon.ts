import { CryptoEngine } from "kdbxweb";
import { argon2id } from "@noble/hashes/argon2";

export function setupArgon2Impl() {
  return CryptoEngine.setArgon2Impl(
    async (pass, salt, memory, time, hashLen, parallelism, _type, version) =>
      argon2id(new Uint8Array(pass), new Uint8Array(salt), {
        t: time,
        p: parallelism,
        m: memory,
        version,
        dkLen: hashLen,
      }),
  );
}
