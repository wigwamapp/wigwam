import { CryptoEngine } from "kdbxweb";
import * as Argon2 from "lib/argon2";

export * from "kdbxweb";

CryptoEngine.setArgon2Impl((pass, salt, _mem, _time, hashLen, parallelism) =>
  Argon2.hash({
    pass: new Uint8Array(pass),
    salt: new Uint8Array(salt),
    mem: 1024 * 15, // 15 MiB
    time: 2,
    hashLen,
    parallelism,
    type: 2, // Argon2id
  }).then(({ hash }) => hash)
);
