import { ethers } from "ethers";
import { wordlists } from "@ethersproject/wordlists";
import { match } from "ts-pattern";
import { assert } from "lib/system/assert";
import * as Encryptor from "lib/encryptor";
import * as Storage from "lib/ext/storage";
import { SeedPharse, AddAccountParams, AccountType } from "core/types";

type Migration = (passKey: CryptoKey) => Promise<void>;

const STORAGE_KEY_PREFIX = "vault";
const MIGRATIONS: ReadonlyArray<Migration> = [];

enum StorageEntity {
  Check = "check",
  MigrationLevel = "mgrnlvl",
  SeedPhrase = "seedphrase",
  AccPrivKey = "accprivkey",
  AccPubKey = "accpubkey",
}

const checkStrgKey = createStorageKey(StorageEntity.Check);
const migrationLevelStrgKey = createStorageKey(StorageEntity.MigrationLevel);
const seedPhraseStrgKey = createStorageKey(StorageEntity.SeedPhrase);
const accPrivKeyStrgKey = createDynamicStorageKey(StorageEntity.AccPrivKey);
const accPubKeyStrgKey = createDynamicStorageKey(StorageEntity.AccPubKey);

export class Vault {
  static async init(password: string) {
    const passwordKey = await Vault.toPasswordKey(password);

    return withError("Failed to unlock wallet", async () => {
      await Vault.runMigrations(passwordKey);
      return new Vault(passwordKey);
    });
  }

  static async setup(
    password: string,
    accParams: AddAccountParams,
    seedPhrase?: SeedPharse
  ) {
    return withError("Failed to create wallet", async () => {
      if (seedPhrase) {
        validateSeedPhrase(seedPhrase);
      }
      validateAddAccountParams(accParams);

      const passwordKey = await Encryptor.generateKey(password);

      return Storage.transact(async () => {
        await Storage.clear();
        await Storage.encryptAndSaveMany(
          [
            [checkStrgKey, null],
            [migrationLevelStrgKey, MIGRATIONS.length],
          ],
          passwordKey
        );

        const vault = new Vault(passwordKey);
        if (seedPhrase) {
          await vault.addSeedPhraseForce(seedPhrase);
        }

        const accountAddress = await vault.addAccountForce(accParams);

        return { vault, accountAddress };
      });
    });
  }

  static isExist() {
    return Storage.isStored(checkStrgKey);
  }

  static hasSeedPhrase() {
    return Storage.isStored(seedPhraseStrgKey);
  }

  private static toPasswordKey(password: string) {
    return withError("Invalid password", async (doThrow) => {
      const passwordKey = await Encryptor.generateKey(password);
      const check = await Storage.fetchAndDecryptOne<any>(
        checkStrgKey,
        passwordKey
      );
      if (check !== null) {
        doThrow();
      }
      return passwordKey;
    });
  }

  private static async runMigrations(passwordKey: CryptoKey) {
    return Storage.transact(async () => {
      try {
        const migrationLevelStored = await Storage.isStored(
          migrationLevelStrgKey
        );
        const migrationLevel = migrationLevelStored
          ? await Storage.fetchAndDecryptOne<number>(
              migrationLevelStrgKey,
              passwordKey
            )
          : 0;
        const migrationsToRun = MIGRATIONS.filter(
          (_m, i) => i >= migrationLevel
        );
        for (const migrate of migrationsToRun) {
          await migrate(passwordKey);
        }
      } catch (err) {
        if (import.meta.env.SNOWPACK_PUBLIC_DEBUG === "true") {
          console.error(err);
        }
      } finally {
        await Storage.encryptAndSaveMany(
          [[migrationLevelStrgKey, MIGRATIONS.length]],
          passwordKey
        );
      }
    });
  }

  constructor(private passwordKey: CryptoKey) {}

  addSeedPhrase(seedPhrase: SeedPharse) {
    validateSeedPhrase(seedPhrase);
    return Storage.transact(() => this.addSeedPhraseForce(seedPhrase));
  }

  addAccount(params: AddAccountParams) {
    validateAddAccountParams(params);
    return Storage.transact(() => this.addAccountForce(params));
  }

  fetchPublicKey(accAddress: string) {
    return withError("Failed to fetch public key", () =>
      Storage.fetchAndDecryptOne<string>(
        accPubKeyStrgKey(accAddress),
        this.passwordKey
      )
    );
  }

  private addSeedPhraseForce(seedPhrase: SeedPharse) {
    return withError("Failed to add Seed Phrase", async () => {
      const seedPhraseExist = await Vault.hasSeedPhrase();
      if (seedPhraseExist) {
        throw new PublicError("Seed phrase already exists");
      }

      await Storage.encryptAndSaveMany(
        [[seedPhraseStrgKey, seedPhrase]],
        this.passwordKey
      );
    });
  }

  private addAccountForce(params: AddAccountParams) {
    return withError("Failed to add account", () =>
      match(params)
        .exhaustive()
        .with({ type: AccountType.HD }, async (p) => {
          const seedPhraseExist = await Vault.hasSeedPhrase();
          if (!seedPhraseExist) {
            throw new PublicError("Seed phrase has not yet been established");
          }

          const { phrase, lang } = await Storage.fetchAndDecryptOne<SeedPharse>(
            seedPhraseStrgKey,
            this.passwordKey
          );

          const { address, privateKey, publicKey } = ethers.Wallet.fromMnemonic(
            phrase,
            p.derivationPath,
            wordlists[lang]
          );

          await Storage.encryptAndSaveMany(
            [
              [accPrivKeyStrgKey(address), privateKey],
              [accPubKeyStrgKey(address), publicKey],
            ],
            this.passwordKey
          );

          return address;
        })
        .with({ type: AccountType.Imported }, async (p) => {
          const { address } = new ethers.Wallet(p.privateKey);
          await Storage.encryptAndSaveMany(
            [[accPrivKeyStrgKey(address), p.privateKey]],
            this.passwordKey
          );
          return address;
        })
        .with({ type: AccountType.Hardware }, async (p) => {
          const address = ethers.utils.computeAddress(
            ethers.utils.arrayify(p.publicKey)
          );
          await Storage.encryptAndSaveMany(
            [[accPubKeyStrgKey(address), p.publicKey]],
            this.passwordKey
          );
          return address;
        })
        .run()
    );
  }
}

function createStorageKey(id: StorageEntity) {
  return combineStorageKey(STORAGE_KEY_PREFIX, id);
}

function createDynamicStorageKey(id: StorageEntity) {
  const keyBase = combineStorageKey(STORAGE_KEY_PREFIX, id);
  return (...subKeys: (number | string)[]) =>
    combineStorageKey(keyBase, ...subKeys);
}

function combineStorageKey(...parts: (string | number)[]) {
  return parts.join("_");
}

async function withError<T>(
  errMessage: string,
  factory: (doThrow: () => void) => Promise<T>
) {
  try {
    return await factory(() => {
      throw new Error("<stub>");
    });
  } catch (err) {
    throw err instanceof PublicError ? err : new PublicError(errMessage);
  }
}

export class PublicError extends Error {
  name = "PublicError";
}

function validateAddAccountParams(params: AddAccountParams) {
  match(params)
    .with({ type: AccountType.HD }, (p) => {
      validateDerivationPath(p.derivationPath);
    })
    .with({ type: AccountType.Imported }, (p) => {
      validatePrivateKey(p.privateKey);
    })
    .with({ type: AccountType.Hardware }, (p) => {
      validatePublicKey(p.publicKey);
    });
}

function validateSeedPhrase({ phrase, lang }: SeedPharse) {
  assert(
    ethers.utils.isValidMnemonic(phrase),
    "Seed phrase in not valid",
    PublicError
  );
  assert(lang in wordlists, "Seed phrase language not supported", PublicError);
}

function validateDerivationPath(path: string) {
  const valid = (() => {
    if (!path.startsWith("m")) {
      return false;
    }
    if (path.length > 1 && path[1] !== "/") {
      return false;
    }

    const parts = path.replace("m", "").split("/").filter(Boolean);
    if (
      !parts.every((path) => {
        const pNum = +(path.includes("'") ? path.replace("'", "") : path);
        return Number.isSafeInteger(pNum) && pNum >= 0;
      })
    ) {
      return false;
    }

    return true;
  })();

  if (!valid) {
    throw new PublicError("Derivation path is invalid");
  }
}

function validatePrivateKey(privKey: string) {
  try {
    new ethers.Wallet(privKey);
  } catch {
    throw new PublicError("Invalid private key");
  }
}

function validatePublicKey(pubKey: string) {
  try {
    ethers.utils.computeAddress(ethers.utils.arrayify(pubKey));
  } catch {
    throw new PublicError("Invalid public key");
  }
}
