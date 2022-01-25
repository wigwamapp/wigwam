import {
  Kdbx,
  ProtectedValue,
  Credentials,
  ByteUtils,
  KdbxUuid,
  KdbxEntry,
  KdbxGroup,
} from "kdbxweb";
import { ethers } from "ethers";
import memoizeOne from "memoize-one";
import {
  createKdbx,
  createGroup,
  getFieldText,
  setFields,
  toUuid,
  getFields,
} from "lib/kdbx";
import { storage } from "lib/ext/storage";
import { t } from "lib/ext/i18n";
import { assert } from "lib/system/assert";
import { typedArrayToBuffer } from "lib/system/typedArrayToBuffer";

import { KDF_PARAMS } from "fixtures/kdbx";

import {
  SeedPharse,
  AddAccountParams,
  AccountSource,
  HDAccount,
  PrivateKeyAccount,
  SocialAccount,
  LedgerAccount,
  WatchOnlyAccount,
  Account,
} from "core/types";
import {
  PublicError,
  withError,
  validateAddAccountParams,
  validateSeedPhrase,
  toDerivedNeuterExtendedKey,
  getSeedPhraseHDNode,
  validateNoAccountDuplicates,
} from "core/common";

const { bytesToBase64, base64ToBytes, zeroBuffer } = ByteUtils;

// Storage entities
enum St {
  KeyFile = "vault_keyfile",
  Data = "vault_data",
}

// Kdbx groups, UUID
enum Gr {
  Accounts = "LC1q3/r/GuXIIBFvZVIdjA==",
  SeedPhrases = "JCwiJUMhmarO4ZvNS99/WA==",
  AccountKeys = "aaovObw95bFaxfkNRBpM6w==",
}

export class Vault {
  static isExist() {
    return storage.isStored(St.KeyFile);
  }

  static async setup(
    passwordHash: string,
    accountsParams: AddAccountParams[],
    seedPhrase?: SeedPharse
  ) {
    return withError(t("failedToSetupWallet"), async (getError) => {
      // Drop if vault already exists
      if (await Vault.isExist()) {
        throw getError();
      }

      if (seedPhrase) {
        validateSeedPhrase(seedPhrase);
      }

      accountsParams.forEach(validateAddAccountParams);

      const keyFile = await Credentials.createRandomKeyFile();
      const credentials = new Credentials(null, keyFile);
      credentials.passwordHash = ProtectedValue.fromString(passwordHash);

      const kdbx = createKdbx(credentials, "Vault", KDF_PARAMS);

      const rootGroup = kdbx.getDefaultGroup();

      for (const groupUuid of Object.values(Gr)) {
        createGroup(rootGroup, new KdbxUuid(groupUuid));
      }

      const vault = new Vault(kdbx);

      if (seedPhrase) {
        vault.addSeedPhraseForce(seedPhrase);
      }

      vault.addAccountsForce(accountsParams);

      const data = await kdbx.save();

      const keyFileB64 = bytesToBase64(keyFile);
      zeroBuffer(keyFile);

      const dataB64 = bytesToBase64(data);
      zeroBuffer(data);

      await storage.putMany([
        [St.KeyFile, keyFileB64],
        [St.Data, dataB64],
      ]);

      return vault;
    });
  }

  static async unlock(passwordHash: string) {
    return withError(t("failedToUnlockWallet"), async (getError) => {
      const [keyFileB64, dataB64] = await storage.fetchMany<string>([
        St.KeyFile,
        St.Data,
      ]);

      if (!(keyFileB64 && dataB64)) {
        throw getError();
      }

      const keyFile = base64ToBytes(keyFileB64);
      const data = typedArrayToBuffer(base64ToBytes(dataB64));

      const credentials = new Credentials(null, keyFile);
      credentials.passwordHash = ProtectedValue.fromString(passwordHash);

      const kdbx = await withError(t("invalidPassword"), () =>
        Kdbx.load(data, credentials).finally(() => zeroBuffer(keyFile))
      );

      return new Vault(kdbx);
    });
  }

  constructor(private kdbx: Kdbx) {}

  // =============//
  // Seed Phrase //
  // ============//

  isSeedPhraseExists() {
    const spGroup = this.getGroup(Gr.SeedPhrases);
    return spGroup.entries[0] instanceof KdbxEntry;
  }

  getSeedPhrase(passwordHash: string) {
    this.verify(passwordHash);

    return withError(t("failedToFetchSeedPhrase"), () =>
      this.getSeedPhraseForce()
    );
  }

  async addSeedPhrase(seedPhrase: SeedPharse) {
    return withError(t("failedToAddSeedPhrase"), async () => {
      validateSeedPhrase(seedPhrase);
      this.addSeedPhraseForce(seedPhrase);

      await this.saveData();
    });
  }

  getNeuterExtendedKey(derivationPath: string) {
    return withError(t("failedToFetchPublicKey"), () => {
      const seedPhrase = this.getSeedPhraseForce();
      return toDerivedNeuterExtendedKey(seedPhrase, derivationPath);
    });
  }

  // =========//
  // Accounts //
  // =========//

  getAccounts() {
    const accGroup = this.getGroup(Gr.Accounts);

    return accGroup.entries.map((entry) =>
      getFields<Account>(entry, { uuid: true })
    );
  }

  async addAccounts(accountParams: AddAccountParams[]) {
    return withError(t("failedToAddWallets"), async () => {
      accountParams.forEach(validateAddAccountParams);
      this.addAccountsForce(accountParams);

      await this.saveData();
    });
  }

  async deleteAccounts(passwordHash: string, accUuids: string[]) {
    this.verify(passwordHash);

    return withError(t("failedToDeleteWallets"), async () => {
      const accountsGroup = this.getGroup(Gr.Accounts);

      for (const accUuid of accUuids) {
        const accEntry = this.getEntry(accountsGroup, accUuid);

        if (accEntry) {
          this.kdbx.remove(accEntry);
        }
      }

      await this.saveData();
    });
  }

  // =============//
  // Account keys //
  // =============//

  getPublicKey(accUuid: string) {
    return withError(t("failedToFetchPublicKey"), () =>
      this.getKeyForce(accUuid, "publicKey")
    );
  }

  sign(accUuid: string, digest: string) {
    return withError(t("failedToSign"), () => {
      const privKey = this.getKeyForce(accUuid, "privateKey");
      const signingKey = new ethers.utils.SigningKey(privKey);

      return signingKey.signDigest(digest);
    });
  }

  getPrivateKey(passwordHash: string, accUuid: string) {
    this.verify(passwordHash);

    return withError(t("failedToFetchPrivateKey"), () =>
      this.getKeyForce(accUuid, "privateKey")
    );
  }

  // ========//
  // Private //
  // ========//

  private addAccountsForce(accountsParams: AddAccountParams[]) {
    const getRootHDNode = memoizeOne(() => {
      const seedPhrase = this.getSeedPhraseForce();
      return getSeedPhraseHDNode(seedPhrase);
    });

    type AccountKeys = {
      privateKey?: ProtectedValue;
      publicKey?: ProtectedValue;
    };

    const toSave: { account: Account; keys: AccountKeys }[] =
      accountsParams.map((params) => {
        const { source, name } = params;
        const base = {
          uuid: KdbxUuid.random().toString(),
          name,
        };

        switch (source) {
          case AccountSource.SeedPhrase: {
            const { derivationPath } = params;

            const rootHDNode = getRootHDNode();
            const { address, privateKey, publicKey } =
              rootHDNode.derivePath(derivationPath);

            const account: HDAccount = {
              ...base,
              source,
              address,
              derivationPath,
            };

            const keys: AccountKeys = {
              privateKey: ProtectedValue.fromString(privateKey),
              publicKey: ProtectedValue.fromString(publicKey),
            };

            return { account, keys };
          }

          case AccountSource.PrivateKey: {
            const { privateKey } = params;

            const publicKey = ethers.utils.computePublicKey(privateKey);
            const address = ethers.utils.computeAddress(publicKey);

            const account: PrivateKeyAccount = {
              ...base,
              source,
              address,
            };

            const keys: AccountKeys = {
              privateKey: ProtectedValue.fromString(privateKey),
              publicKey: ProtectedValue.fromString(publicKey),
            };

            return { account, keys };
          }

          case AccountSource.OpenLogin: {
            const { privateKey, social } = params;

            const publicKey = ethers.utils.computePublicKey(privateKey);
            const address = ethers.utils.computeAddress(publicKey);

            const account: SocialAccount = {
              ...base,
              source,
              address,
              social,
            };

            const keys: AccountKeys = {
              privateKey: ProtectedValue.fromString(privateKey),
              publicKey: ProtectedValue.fromString(publicKey),
            };

            return { account, keys };
          }

          case AccountSource.Ledger: {
            const { derivationPath, publicKey } = params;

            const address = ethers.utils.computeAddress(publicKey);

            const account: LedgerAccount = {
              ...base,
              source,
              address,
              derivationPath,
            };

            const keys: AccountKeys = {
              publicKey: ProtectedValue.fromString(publicKey),
            };

            return { account, keys };
          }

          case AccountSource.Address: {
            let { address } = params;

            address = ethers.utils.getAddress(address);

            const account: WatchOnlyAccount = {
              ...base,
              source,
              address,
            };

            const keys: AccountKeys = {};

            return { account, keys };
          }
        }
      });

    getRootHDNode.clear();

    const prevAccounts = this.getAccounts();
    const nextAccounts = [
      prevAccounts,
      toSave.map(({ account }) => account),
    ].flat();

    validateNoAccountDuplicates(nextAccounts);

    for (const { account, keys } of toSave) {
      const { uuid, ...accFields } = account;

      const accEntry = this.createEntry(Gr.Accounts, uuid);
      setFields(accEntry, accFields);

      const keysEntry = this.createEntry(Gr.AccountKeys, uuid);
      setFields(keysEntry, keys);
    }
  }

  private addSeedPhraseForce(seedPhrase: SeedPharse) {
    if (this.isSeedPhraseExists()) {
      throw new PublicError(t("seedPhraseAlreadyExists"));
    }

    const entry = this.createEntry(Gr.SeedPhrases);

    entry.fields.set("phrase", ProtectedValue.fromString(seedPhrase.phrase));
    entry.fields.set("lang", seedPhrase.lang);
  }

  private getKeyForce(accUuid: string, fieldName: string) {
    const entry = this.getEntry(Gr.AccountKeys, accUuid);
    assert(entry, "Account not found");

    return getFieldText(entry, fieldName);
  }

  private getSeedPhraseForce() {
    const seedPhraseExists = this.isSeedPhraseExists();
    if (!seedPhraseExists) {
      throw new PublicError(t("seedPhraseNotEstablished"));
    }

    const entry = this.getGroup(Gr.SeedPhrases).entries[0];

    const seedPhrase: SeedPharse = {
      phrase: getFieldText(entry, "phrase"),
      lang: getFieldText(entry, "lang"),
    };

    return seedPhrase;
  }

  private verify(passwordHash: string) {
    withError(t("invalidPassword"), (getError) => {
      if (this.kdbx.credentials.passwordHash?.getText() !== passwordHash) {
        throw getError();
      }
    });
  }

  private async saveData() {
    const data = await this.kdbx.save();

    const dataB64 = bytesToBase64(data);
    zeroBuffer(data);

    await storage.put(St.Data, dataB64);
  }

  private createEntry(
    groupUuid: Gr,
    uuid: KdbxUuid | string = KdbxUuid.random()
  ) {
    const parentGroup = this.getGroup(groupUuid);

    const entry = new KdbxEntry();
    entry.uuid = toUuid(uuid);
    entry.parentGroup = parentGroup;
    entry.autoType.enabled = false;

    parentGroup.entries.push(entry);

    return entry;
  }

  private getEntry(groupOrUuid: KdbxGroup | Gr, entryUuid: KdbxUuid | string) {
    const group =
      groupOrUuid instanceof KdbxGroup
        ? groupOrUuid
        : this.getGroup(groupOrUuid);

    for (const entry of group.entries) {
      if (entry.uuid.equals(entryUuid)) {
        return entry;
      }
    }

    return null;
  }

  private getGroup(uuid: Gr) {
    const root = this.kdbx.getDefaultGroup();

    for (const group of root.groups) {
      if (group.uuid.equals(uuid)) {
        return group;
      }
    }

    throw new Error("Group not found");
  }
}
