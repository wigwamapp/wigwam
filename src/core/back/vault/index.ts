import { ethers } from "ethers";
import { match } from "ts-pattern";
import memoizeOne from "memoize-one";

import { getRandomInt } from "lib/system/randomInt";
import { getCryptoKey, getRandomBytes } from "lib/crypto-utils";
import { encryptAndSaveMany, fetchAndDecryptOne } from "lib/enc-storage";
import { storage } from "lib/ext/storage";
import { t } from "lib/ext/i18n";
import { SeedPharse, AddAccountParams, AccountType } from "core/types";
import {
  PublicError,
  withError,
  validateAccountExistence,
  validateAddAccountParams,
  validateSeedPhrase,
  toDerivedNeuterExtendedKey,
  getSeedPhraseHDNode,
} from "core/common";

import { MIGRATIONS, Data } from "./data";

const MAX_DECRYPT_ATTEMPTS = 10;

export class Vault {
  static decryptAttempts = parseInt(sessionStorage.decryptAttempts ?? 0);

  static async unlock(passwordHash: string) {
    const cryptoKey = await Vault.getCryptoKeyCheck(passwordHash);

    return withError(t("failedToUnlockWallet"), async () => {
      await Vault.runMigrations(cryptoKey);
      return new Vault(cryptoKey);
    });
  }

  static async setup(
    passwordHash: string,
    accounts: AddAccountParams[],
    seedPhrase?: SeedPharse
  ) {
    return withError(t("failedToSetupWallet"), async (doThrow) => {
      // Drop if wallet already exists
      if (await Vault.isExist()) {
        doThrow();
      }

      if (seedPhrase) {
        validateSeedPhrase(seedPhrase);
      }
      accounts.forEach(validateAddAccountParams);

      const cryptoKey = await getCryptoKey(passwordHash);

      return storage.transact(async () => {
        await encryptAndSaveMany(
          [
            Data.check(getRandomBytes(64)),
            Data.migrationLevel(MIGRATIONS.length),
          ],
          cryptoKey
        );

        const vault = new Vault(cryptoKey);
        if (seedPhrase) {
          await vault.addSeedPhraseForce(seedPhrase);
        }

        const accountAddresses = await vault.addAccountsForce(accounts);

        return { vault, accountAddresses };
      });
    });
  }

  static isExist() {
    return storage.isStored(Data.check());
  }

  static hasSeedPhrase() {
    return storage.isStored(Data.seedPhrase());
  }

  static async fetchSeedPhrase(passwordHash: string) {
    const cryptoKey = await Vault.getCryptoKeyCheck(passwordHash);

    return withError(t("failedToFetchSeedPhrase"), () =>
      Vault.getSeedPhraseCheck(cryptoKey)
    );
  }

  static async fetchPrivateKey(passwordHash: string, accAddress: string) {
    const cryptoKey = await Vault.getCryptoKeyCheck(passwordHash);

    return withError(t("failedToFetchPrivateKey"), () =>
      fetchAndDecryptOne<string>(Data.privateKey(accAddress)(), cryptoKey)
    );
  }

  static async deleteAccounts(
    passwordHash: string,
    accountAddresses: string[]
  ) {
    await Vault.getCryptoKeyCheck(passwordHash);

    return withError(t("failedToDeleteWallets"), () =>
      storage.transact(() =>
        storage.remove(
          accountAddresses
            .map((address) => [
              Data.privateKey(address)(),
              Data.publicKey(address)(),
            ])
            .flat()
        )
      )
    );
  }

  private static getCryptoKeyCheck(passwordHash: string) {
    return withError(t("invalidPassword"), async () => {
      try {
        const cryptoKey = await getCryptoKey(passwordHash);
        await fetchAndDecryptOne(Data.check(), cryptoKey);

        Vault.decryptAttempts = 0;

        return cryptoKey;
      } catch (err) {
        if (
          process.env.NODE_ENV !== "development" &&
          ++Vault.decryptAttempts > MAX_DECRYPT_ATTEMPTS
        ) {
          await new Promise((r) => setTimeout(r, getRandomInt(3_000, 5_000)));
        }

        throw err;
      } finally {
        sessionStorage.decryptAttempts = Vault.decryptAttempts;
      }
    });
  }

  private static async runMigrations(cryptoKey: CryptoKey) {
    return storage.transact(async () => {
      try {
        const migrationLevelStored = await storage.isStored(
          Data.migrationLevel()
        );
        const migrationLevel = migrationLevelStored
          ? await fetchAndDecryptOne<number>(Data.migrationLevel(), cryptoKey)
          : 0;
        const migrationsToRun = MIGRATIONS.filter(
          (_m, i) => i >= migrationLevel
        );
        for (const migrate of migrationsToRun) {
          await migrate(cryptoKey);
        }
      } catch (err) {
        console.error(err);
      } finally {
        await encryptAndSaveMany(
          [Data.migrationLevel(MIGRATIONS.length)],
          cryptoKey
        );
      }
    });
  }

  private static async getSeedPhraseCheck(cryptoKey: CryptoKey) {
    const seedPhraseExists = await Vault.hasSeedPhrase();
    if (!seedPhraseExists) {
      throw new PublicError(t("seedPhraseNotEstablished"));
    }

    return fetchAndDecryptOne<SeedPharse>(Data.seedPhrase(), cryptoKey);
  }

  constructor(private cryptoKey: CryptoKey) {}

  addSeedPhrase(seedPhrase: SeedPharse) {
    validateSeedPhrase(seedPhrase);
    return storage.transact(() => this.addSeedPhraseForce(seedPhrase));
  }

  addAccounts(accounts: AddAccountParams[]) {
    accounts.forEach(validateAddAccountParams);
    return storage.transact(() => this.addAccountsForce(accounts));
  }

  fetchPublicKey(accAddress: string) {
    return withError(t("failedToFetchPublicKey"), () =>
      fetchAndDecryptOne<string>(Data.publicKey(accAddress)(), this.cryptoKey)
    );
  }

  fetchNeuterExtendedKey(derivationPath: string) {
    return withError(t("failedToFetchPublicKey"), async () => {
      const seedPhrase = await Vault.getSeedPhraseCheck(this.cryptoKey);
      return toDerivedNeuterExtendedKey(seedPhrase, derivationPath);
    });
  }

  sign(accAddress: string, digest: string) {
    return withError(t("failedToSign"), async () => {
      const dataKey = Data.privateKey(accAddress)();
      const privKeyExists = await storage.isStored(dataKey);
      if (!privKeyExists) {
        throw new PublicError(t("cannotSignForWallet"));
      }

      const privKey = await fetchAndDecryptOne<string>(dataKey, this.cryptoKey);

      const signingKey = new ethers.utils.SigningKey(privKey);
      return signingKey.signDigest(digest);
    });
  }

  private addSeedPhraseForce(seedPhrase: SeedPharse) {
    return withError(t("failedToAddSeedPhrase"), async () => {
      const seedPhraseExists = await Vault.hasSeedPhrase();
      if (seedPhraseExists) {
        throw new PublicError(t("seedPhraseAlreadyExists"));
      }

      await encryptAndSaveMany([Data.seedPhrase(seedPhrase)], this.cryptoKey);
    });
  }

  private addAccountsForce(accounts: AddAccountParams[]) {
    return withError(t("failedToAddWallets"), async () => {
      // Generate rest crypto keys if needed
      type AccountStorageData = {
        address: string;
        publicKey?: string;
        privateKey?: string;
      };

      const getRootHDNode = memoizeOne(async () => {
        const seedPhrase = await Vault.getSeedPhraseCheck(this.cryptoKey);
        return getSeedPhraseHDNode(seedPhrase);
      });

      const accountsData: AccountStorageData[] = await Promise.all(
        accounts.map((params) =>
          match(params)
            .with({ type: AccountType.HD }, async (p) => {
              const rootHDNode = await getRootHDNode();
              const { address, privateKey, publicKey } = rootHDNode.derivePath(
                p.derivationPath
              );

              return { address, privateKey, publicKey };
            })
            .with({ type: AccountType.Imported }, async ({ privateKey }) => {
              const publicKey = ethers.utils.computePublicKey(privateKey);
              const address = ethers.utils.computeAddress(publicKey);

              return { address, privateKey, publicKey };
            })
            .with({ type: AccountType.External }, async ({ publicKey }) => {
              const address = ethers.utils.computeAddress(publicKey);

              return { address, publicKey };
            })
            .with({ type: AccountType.Void }, async ({ address }) => {
              address = ethers.utils.getAddress(address);

              return { address };
            })
            .exhaustive()
        )
      );

      // Validate accounts existence
      await Promise.all(
        accountsData.map(({ address }) => validateAccountExistence(address))
      );

      // Save them
      const toSave: [string, unknown][] = [];

      for (const { address, publicKey, privateKey } of accountsData) {
        if (publicKey) {
          toSave.push(Data.publicKey(address)(publicKey));
        }
        if (privateKey) {
          toSave.push(Data.privateKey(address)(privateKey));
        }
      }

      if (toSave.length > 0) {
        await encryptAndSaveMany(toSave, this.cryptoKey);
      }

      // Return account addresses
      return accountsData.map(({ address }) => address);
    });
  }
}
