import { ethers } from "ethers";
import * as Encryptor from "lib/encryptor";
import * as Storage from "lib/ext/storage";

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

  static async setup(seedPhrase: string, password: string) {
    const passwordKey = await Vault.toPasswordKey(password);
    return withError("Failed to create wallet", async () => {
      await Storage.transact(async () => {
        await Storage.clear();
        await Storage.encryptAndSaveMany(
          [
            [checkStrgKey, null],
            [migrationLevelStrgKey, MIGRATIONS.length],
            [seedPhraseStrgKey, seedPhrase],
          ],
          passwordKey
        );
      });
      return new Vault(passwordKey);
    });
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

  hasSeedPhrase() {
    return Storage.isStored(seedPhraseStrgKey);
  }

  addAccount(derivationPath: string) {
    return withError("Failed to create account", () =>
      Storage.transact(async () => {
        const seedPhrase = await Storage.fetchAndDecryptOne<string>(
          seedPhraseStrgKey,
          this.passwordKey
        );

        const {
          address: account,
          privateKey,
          publicKey,
        } = ethers.Wallet.fromMnemonic(seedPhrase, derivationPath);

        await Storage.encryptAndSaveMany(
          [
            [accPrivKeyStrgKey(account), privateKey],
            [accPubKeyStrgKey(account), publicKey],
          ],
          this.passwordKey
        );

        return account;
      })
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
