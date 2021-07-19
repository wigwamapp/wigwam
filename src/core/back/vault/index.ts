import { ethers } from "ethers";
import { wordlists } from "@ethersproject/wordlists";
import { match } from "ts-pattern";

import * as Encryptor from "lib/encryptor";
import * as Storage from "lib/enc-storage";
import { t } from "lib/ext/i18n";
import { SeedPharse, AddAccountsParams, AccountType } from "core/types";
import {
  PublicError,
  withError,
  validateAccountExistence,
  validateAddAccountsParams,
  validateSeedPhrase,
} from "core/helpers";

import { MIGRATIONS, Data } from "./data";

export class Vault {
  static async unlock(password: string) {
    const passwordKey = await Vault.toPasswordKey(password);

    return withError(t("failedToUnlockWallet"), async () => {
      await Vault.runMigrations(passwordKey);
      return new Vault(passwordKey);
    });
  }

  static async setup(
    password: string,
    accountsParams: AddAccountsParams,
    seedPhrase?: SeedPharse
  ) {
    return withError(t("failedToCreateWallet"), async (doThrow) => {
      // Drop if wallet already exists
      if (await Vault.isExist()) {
        doThrow();
      }

      if (seedPhrase) {
        validateSeedPhrase(seedPhrase);
      }
      validateAddAccountsParams(accountsParams);

      const passwordKey = await Encryptor.generateKey(password);

      return Storage.transact(async () => {
        await Storage.encryptAndSaveMany(
          [Data.check(null), Data.migrationLevel(MIGRATIONS.length)],
          passwordKey
        );

        const vault = new Vault(passwordKey);
        if (seedPhrase) {
          await vault.addSeedPhraseForce(seedPhrase);
        }

        const accountAddresses = await vault.addAccountsForce(accountsParams);

        return { vault, accountAddresses };
      });
    });
  }

  static isExist() {
    return Storage.isStored(Data.check());
  }

  static hasSeedPhrase() {
    return Storage.isStored(Data.seedPhrase());
  }

  static async fetchSeedPhrase(password: string) {
    const passwordKey = await Vault.toPasswordKey(password);
    return withError(t("failedToFetchSeedPhrase"), async () => {
      const seedPhraseExists = await Vault.hasSeedPhrase();
      if (!seedPhraseExists) {
        throw new PublicError(t("seedPhraseNotEstablished"));
      }

      return Storage.fetchAndDecryptOne<SeedPharse>(
        Data.seedPhrase(),
        passwordKey
      );
    });
  }

  static async fetchPrivateKey(password: string, accAddress: string) {
    const passwordKey = await Vault.toPasswordKey(password);
    return withError(t("failedToFetchPrivateKey"), () =>
      Storage.fetchAndDecryptOne<string>(
        Data.privateKey(accAddress)(),
        passwordKey
      )
    );
  }

  static async deleteAccounts(password: string, accountAddresses: string[]) {
    await Vault.toPasswordKey(password);
    return withError(t("failedToDeleteAccount"), () =>
      Storage.transact(() =>
        Storage.remove(
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

  private static toPasswordKey(password: string) {
    return withError(t("invalidPassword"), async (doThrow) => {
      const passwordKey = await Encryptor.generateKey(password);
      const check = await Storage.fetchAndDecryptOne(Data.check(), passwordKey);
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
          Data.migrationLevel()
        );
        const migrationLevel = migrationLevelStored
          ? await Storage.fetchAndDecryptOne<number>(
              Data.migrationLevel(),
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
        if (process.env.NODE_ENV === "development") {
          console.error(err);
        }
      } finally {
        await Storage.encryptAndSaveMany(
          [Data.migrationLevel(MIGRATIONS.length)],
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

  addAccounts(params: AddAccountsParams) {
    validateAddAccountsParams(params);
    return Storage.transact(() => this.addAccountsForce(params));
  }

  fetchPublicKey(accAddress: string) {
    return withError(t("failedToFetchPublicKey"), () =>
      Storage.fetchAndDecryptOne<string>(
        Data.publicKey(accAddress)(),
        this.passwordKey
      )
    );
  }

  sign(accAddress: string, digest: string) {
    return withError(t("failedToSign"), async () => {
      const dataKey = Data.privateKey(accAddress)();
      const privKeyExists = await Storage.isStored(dataKey);
      if (!privKeyExists) {
        throw new PublicError(t("cannotSignForAccount"));
      }

      const privKey = await Storage.fetchAndDecryptOne<string>(
        dataKey,
        this.passwordKey
      );

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

      await Storage.encryptAndSaveMany(
        [Data.seedPhrase(seedPhrase)],
        this.passwordKey
      );
    });
  }

  private addAccountsForce(params: AddAccountsParams) {
    return withError(t("failedToAddAccount"), () =>
      match(params)
        .with({ type: AccountType.HD }, async (p) => {
          const seedPhraseExists = await Vault.hasSeedPhrase();
          if (!seedPhraseExists) {
            throw new PublicError(t("seedPhraseNotEstablished"));
          }

          const { phrase, lang } = await Storage.fetchAndDecryptOne<SeedPharse>(
            Data.seedPhrase(),
            this.passwordKey
          );

          const toAdd = await Promise.all(
            p.derivationPaths.map(async (path) => {
              const { address, privateKey, publicKey } =
                ethers.Wallet.fromMnemonic(phrase, path, wordlists[lang]);
              await validateAccountExistence(address);
              return { address, privateKey, publicKey };
            })
          );

          await Storage.encryptAndSaveMany(
            toAdd
              .map(({ address, privateKey, publicKey }) => [
                Data.privateKey(address)(privateKey),
                Data.publicKey(address)(publicKey),
              ])
              .flat(),
            this.passwordKey
          );

          return toAdd.map(({ address }) => address);
        })
        .with({ type: AccountType.Imported }, async (p) => {
          const toAdd = await Promise.all(
            p.privateKeys.map(async (privateKey) => {
              const { publicKey, address } = new ethers.Wallet(privateKey);
              await validateAccountExistence(address);
              return { address, privateKey, publicKey };
            })
          );

          await Storage.encryptAndSaveMany(
            toAdd
              .map(({ address, privateKey, publicKey }) => [
                Data.privateKey(address)(privateKey),
                Data.publicKey(address)(publicKey),
              ])
              .flat(),
            this.passwordKey
          );

          return toAdd.map(({ address }) => address);
        })
        .with({ type: AccountType.External }, async (p) => {
          const toAdd = await Promise.all(
            p.publicKeys.map(async (publicKey) => {
              const address = ethers.utils.computeAddress(publicKey);
              await validateAccountExistence(address);
              return { address, publicKey };
            })
          );

          await Storage.encryptAndSaveMany(
            toAdd.map(({ address, publicKey }) =>
              Data.publicKey(address)(publicKey)
            ),
            this.passwordKey
          );

          return toAdd.map(({ address }) => address);
        })
        .with({ type: AccountType.Void }, async ({ addresses }) => {
          await Promise.all(addresses.map(validateAccountExistence));
          return addresses;
        })
        .exhaustive()
    );
  }
}
