import { ethers } from "ethers";
import { wordlists } from "@ethersproject/wordlists";
import { match } from "ts-pattern";

import { getCryptoKey, getRandomBytes } from "lib/crypto-utils";
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
    return withError(t("failedToCreateWallet"), async (doThrow) => {
      // Drop if wallet already exists
      if (await Vault.isExist()) {
        doThrow();
      }

      if (seedPhrase) {
        validateSeedPhrase(seedPhrase);
      }
      accounts.forEach(validateAddAccountParams);

      const cryptoKey = await getCryptoKey(passwordHash);

      return Storage.transact(async () => {
        await Storage.encryptAndSaveMany(
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
    return Storage.isStored(Data.check());
  }

  static hasSeedPhrase() {
    return Storage.isStored(Data.seedPhrase());
  }

  static async fetchSeedPhrase(passwordHash: string) {
    const cryptoKey = await Vault.getCryptoKeyCheck(passwordHash);

    return withError(t("failedToFetchSeedPhrase"), async () => {
      const seedPhraseExists = await Vault.hasSeedPhrase();
      if (!seedPhraseExists) {
        throw new PublicError(t("seedPhraseNotEstablished"));
      }

      return Storage.fetchAndDecryptOne<SeedPharse>(
        Data.seedPhrase(),
        cryptoKey
      );
    });
  }

  static async fetchPrivateKey(passwordHash: string, accAddress: string) {
    const cryptoKey = await Vault.getCryptoKeyCheck(passwordHash);

    return withError(t("failedToFetchPrivateKey"), () =>
      Storage.fetchAndDecryptOne<string>(
        Data.privateKey(accAddress)(),
        cryptoKey
      )
    );
  }

  static async deleteAccounts(
    passwordHash: string,
    accountAddresses: string[]
  ) {
    await Vault.getCryptoKeyCheck(passwordHash);

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

  private static getCryptoKeyCheck(passwordHash: string) {
    return withError(t("invalidPassword"), async () => {
      const cryptoKey = await getCryptoKey(passwordHash);
      await Storage.fetchAndDecryptOne(Data.check(), cryptoKey);
      return cryptoKey;
    });
  }

  private static async runMigrations(cryptoKey: CryptoKey) {
    return Storage.transact(async () => {
      try {
        const migrationLevelStored = await Storage.isStored(
          Data.migrationLevel()
        );
        const migrationLevel = migrationLevelStored
          ? await Storage.fetchAndDecryptOne<number>(
              Data.migrationLevel(),
              cryptoKey
            )
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
        await Storage.encryptAndSaveMany(
          [Data.migrationLevel(MIGRATIONS.length)],
          cryptoKey
        );
      }
    });
  }

  constructor(private cryptoKey: CryptoKey) {}

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
        this.cryptoKey
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
        this.cryptoKey
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
        this.cryptoKey
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
        this.cryptoKey
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
                  this.cryptoKey
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
        await Storage.encryptAndSaveMany(toSave, this.cryptoKey);
      }

      // Return account addresses
      return accountsData.map(({ address }) => address);
    });
  }
}
