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
} from "core/helpers";

import {
  MIGRATIONS,
  checkStrgKey,
  migrationLevelStrgKey,
  seedPhraseStrgKey,
  accPrivKeyStrgKey,
  accPubKeyStrgKey,
} from "./data";

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
    accParams: AddAccountParams,
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
      validateAddAccountParams(accParams);

      const passwordKey = await Encryptor.generateKey(password);

      return Storage.transact(async () => {
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

  static async fetchSeedPhrase(password: string) {
    const passwordKey = await Vault.toPasswordKey(password);
    return withError(t("failedToFetchSeedPhrase"), async () => {
      const seedPhraseExists = await Vault.hasSeedPhrase();
      if (!seedPhraseExists) {
        throw new PublicError(t("seedPhraseNotEstablished"));
      }

      return Storage.fetchAndDecryptOne<SeedPharse>(
        seedPhraseStrgKey,
        passwordKey
      );
    });
  }

  static async fetchPrivateKey(password: string, accAddress: string) {
    const passwordKey = await Vault.toPasswordKey(password);
    return withError(t("failedToFetchPrivateKey"), () =>
      Storage.fetchAndDecryptOne<string>(
        accPrivKeyStrgKey(accAddress),
        passwordKey
      )
    );
  }

  static async deleteAccount(password: string, accAddress: string) {
    await Vault.toPasswordKey(password);
    return withError(t("failedToDeleteAccount"), () =>
      Storage.transact(() =>
        Storage.remove([
          accPrivKeyStrgKey(accAddress),
          accPubKeyStrgKey(accAddress),
        ])
      )
    );
  }

  private static toPasswordKey(password: string) {
    return withError(t("invalidPassword"), async (doThrow) => {
      const passwordKey = await Encryptor.generateKey(password);
      const check = await Storage.fetchAndDecryptOne(checkStrgKey, passwordKey);
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
        if (process.env.NODE_ENV === "development") {
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
    return withError(t("failedToFetchPublicKey"), () =>
      Storage.fetchAndDecryptOne<string>(
        accPubKeyStrgKey(accAddress),
        this.passwordKey
      )
    );
  }

  sign(accAddress: string, digest: string) {
    return withError(t("failedToSign"), async () => {
      const strgKey = accPrivKeyStrgKey(accAddress);
      const privKeyExists = await Storage.isStored(strgKey);
      if (!privKeyExists) {
        throw new PublicError(t("cannotSignForAccount"));
      }

      const privKey = await Storage.fetchAndDecryptOne<string>(
        strgKey,
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
        [[seedPhraseStrgKey, seedPhrase]],
        this.passwordKey
      );
    });
  }

  private addAccountForce(params: AddAccountParams) {
    return withError(t("failedToAddAccount"), () =>
      match(params)
        .with({ type: AccountType.HD }, async (p) => {
          const seedPhraseExists = await Vault.hasSeedPhrase();
          if (!seedPhraseExists) {
            throw new PublicError(t("seedPhraseNotEstablished"));
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

          await validateAccountExistence(address);
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
          const { publicKey, address } = new ethers.Wallet(p.privateKey);

          await validateAccountExistence(address);
          await Storage.encryptAndSaveMany(
            [
              [accPrivKeyStrgKey(address), p.privateKey],
              [accPubKeyStrgKey(address), publicKey],
            ],
            this.passwordKey
          );

          return address;
        })
        .with({ type: AccountType.External }, async (p) => {
          const address = ethers.utils.computeAddress(p.publicKey);

          await validateAccountExistence(address);
          await Storage.encryptAndSaveMany(
            [[accPubKeyStrgKey(address), p.publicKey]],
            this.passwordKey
          );

          return address;
        })
        .with({ type: AccountType.Void }, async ({ address }) => {
          await validateAccountExistence(address);
          return address;
        })
        .exhaustive()
    );
  }
}
