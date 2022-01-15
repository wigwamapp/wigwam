import { CryptoEngine } from "kdbxweb";
import * as Argon2 from "lib/argon2";

export * from "kdbxweb";

CryptoEngine.setArgon2Impl(
  (pass, salt, mem, time, hashLen, parallelism, type) =>
    Argon2.hash({
      pass: new Uint8Array(pass),
      salt: new Uint8Array(salt),
      mem,
      time,
      hashLen,
      parallelism,
      type,
    }).then(({ hash }) => hash)
);
