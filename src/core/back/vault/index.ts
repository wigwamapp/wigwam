import { ethers } from "ethers";
import { wordlists } from "@ethersproject/wordlists";
import { match } from "ts-pattern";

import * as Encryptor from "lib/encryptor";
import * as Storage from "lib/enc-storage";
import { t } from "lib/ext/i18n";
import { SeedPharse, AddAccountParams, AccountType } from "core/types";
import {
  PublicError,
  withError,
  validateAccountExistence,
  validateAddAccountParams,
  validateSeedPhrase,
  toNeuterExtendedKey,
} from "core/common";

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
    accounts: AddAccountParams[],
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
      accounts.forEach(validateAddAccountParams);

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

        const accountAddresses = await vault.addAccountsForce(accounts);

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
    return withError(t("failedToDeleteAccounts"), () =>
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

  addAccounts(accounts: AddAccountParams[]) {
    accounts.forEach(validateAddAccountParams);
    return Storage.transact(() => this.addAccountsForce(accounts));
  }

  fetchPublicKey(accAddress: string) {
    return withError(t("failedToFetchPublicKey"), () =>
      Storage.fetchAndDecryptOne<string>(
        Data.publicKey(accAddress)(),
        this.passwordKey
      )
    );
  }

  fetchNeuterExtendedKey(derivationPath: string) {
    return withError(t("failedToFetchPublicKey"), async () => {
      const seedPhraseExists = await Vault.hasSeedPhrase();
      if (!seedPhraseExists) {
        throw new PublicError(t("seedPhraseNotEstablished"));
      }

      const seedPhrase = await Storage.fetchAndDecryptOne<SeedPharse>(
        Data.seedPhrase(),
        this.passwordKey
      );

      return toNeuterExtendedKey(seedPhrase, derivationPath);
    });
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

  private addAccountsForce(accounts: AddAccountParams[]) {
    return withError(t("failedToAddAccounts"), async () => {
      // Generate rest crypto keys if needed
      type AccountStorageData = {
        address: string;
        publicKey?: string;
        privateKey?: string;
      };

      const accountsData: AccountStorageData[] = await Promise.all(
        accounts.map((params) =>
          match(params)
            .with({ type: AccountType.HD }, async (p) => {
              const seedPhraseExists = await Vault.hasSeedPhrase();
              if (!seedPhraseExists) {
                throw new PublicError(t("seedPhraseNotEstablished"));
              }

              const { phrase, lang } =
                await Storage.fetchAndDecryptOne<SeedPharse>(
                  Data.seedPhrase(),
                  this.passwordKey
                );

              const { address, privateKey, publicKey } =
                ethers.Wallet.fromMnemonic(
                  phrase,
                  p.derivationPath,
                  wordlists[lang]
                );

              return { address, privateKey, publicKey };
            })
            .with({ type: AccountType.Imported }, async ({ privateKey }) => {
              const { publicKey, address } = new ethers.Wallet(privateKey);

              return { address, privateKey, publicKey };
            })
            .with({ type: AccountType.External }, async ({ publicKey }) => {
              const address = ethers.utils.computeAddress(publicKey);

              return { address, publicKey };
            })
            .with({ type: AccountType.Void }, async ({ address }) => {
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
        await Storage.encryptAndSaveMany(toSave, this.passwordKey);
      }

      // Return account addresses
      return accountsData.map(({ address }) => address);
    });
  }
}
