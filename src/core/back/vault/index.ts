import {
  Kdbx,
  ProtectedValue,
  Credentials,
  ByteUtils,
  KdbxUuid,
  KdbxEntry,
  KdbxGroup,
} from "kdbxweb";
import { BytesLike, ethers, Signature } from "ethers";
import { hexZeroPad, splitSignature, stripZeros } from "@ethersproject/bytes";
import * as secp256k1 from "@noble/secp256k1";
import {
  personalSign,
  signTypedData,
  SignTypedDataVersion,
} from "@metamask/eth-sig-util";
import { Buffer } from "buffer";
import memoizeOne from "memoize-one";
import {
  createKdbx,
  createGroup,
  setFields,
  toUuid,
  importProtected,
  exportFields,
  exportProtected,
} from "lib/kdbx";
import { storage } from "lib/ext/storage";
import { t } from "lib/ext/i18n";
import { assert } from "lib/system/assert";

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
  SigningStandard,
} from "core/types";
import {
  PublicError,
  withError,
  validateAddAccountParams,
  validateSeedPhrase,
  toNeuterExtendedKey,
  getSeedPhraseHDNode,
  validateNoAccountDuplicates,
  validateDerivationPath,
  add0x,
} from "core/common";

const {
  bytesToBase64,
  base64ToBytes,
  zeroBuffer,
  arrayToBuffer,
  arrayBufferEquals,
} = ByteUtils;

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
  static onPasswordUsage?: (success: boolean) => void | Promise<void>;

  static isExist() {
    return storage.isStored(St.KeyFile);
  }

  static async setup(
    password: string,
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
      const credentials = new Credentials(importProtected(password), keyFile);

      const kdbx = createKdbx(credentials, "Vault", KDF_PARAMS);

      const rootGroup = kdbx.getDefaultGroup();
      for (const groupUuid of Object.values(Gr)) {
        createGroup(rootGroup, groupUuid);
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

  static async unlock(password: string) {
    return withError(t("failedToUnlockWallet"), async (getError) => {
      const [keyFileB64, dataB64] = await storage.fetchMany<string>([
        St.KeyFile,
        St.Data,
      ]);

      if (!(keyFileB64 && dataB64)) {
        throw getError();
      }

      const keyFile = base64ToBytes(keyFileB64);
      const data = arrayToBuffer(base64ToBytes(dataB64));

      const kdbx = await withError(t("invalidPassword"), async () => {
        let success = true;

        try {
          const credentials = new Credentials(
            importProtected(password),
            keyFile
          );

          return await Kdbx.load(data, credentials);
        } catch (err) {
          success = false;

          throw err;
        } finally {
          zeroBuffer(keyFile);
          await Vault.onPasswordUsage?.(success);
        }
      });

      return new Vault(kdbx);
    });
  }

  constructor(private readonly kdbx: Kdbx) {}

  cleanup() {
    this.kdbx.cleanup({
      historyRules: true,
      customIcons: true,
      binaries: true,
    });
  }

  // ============//
  // Credentials //
  // ============//

  async changePassword(current: string, next: string) {
    await this.verify(current);

    return withError(t("failedToChangePassword"), async () => {
      await this.kdbx.credentials.setPassword(importProtected(next));

      const keyFile = await Credentials.createRandomKeyFile();
      await this.kdbx.credentials.setKeyFile(keyFile);

      const keyFileB64 = bytesToBase64(keyFile);
      zeroBuffer(keyFile);

      const data = await this.kdbx.save();

      const dataB64 = bytesToBase64(data);
      zeroBuffer(data);

      await storage.putMany([
        [St.KeyFile, keyFileB64],
        [St.Data, dataB64],
      ]);
    });
  }

  // ============//
  // Seed Phrase //
  // ============//

  isSeedPhraseExists() {
    const spGroup = this.getGroup(Gr.SeedPhrases);
    return spGroup.entries[0] instanceof KdbxEntry;
  }

  async getSeedPhrase(password: string) {
    await this.verify(password);

    return withError(t("failedToFetchSeedPhrase"), () =>
      this.getSeedPhraseForce()
    );
  }

  getNeuterExtendedKey(derivationPath: string) {
    return withError(t("failedToFetchPublicKey"), () => {
      validateDerivationPath(derivationPath);

      const seedPhrase = this.getSeedPhraseForce();

      const neuterExtendedKey = toNeuterExtendedKey(
        getSeedPhraseHDNode(seedPhrase),
        derivationPath
      );

      return exportProtected(ProtectedValue.fromString(neuterExtendedKey));
    });
  }

  // =========//
  // Accounts //
  // =========//

  getAccounts() {
    const accGroup = this.getGroup(Gr.Accounts);

    return accGroup.entries.map((entry) =>
      exportFields<Account>(entry, { uuid: true })
    );
  }

  async addAccounts(
    accountParams: AddAccountParams[],
    seedPhrase?: SeedPharse
  ) {
    return withError(t("failedToAddWallets"), async () => {
      if (seedPhrase) {
        validateSeedPhrase(seedPhrase);
      }

      accountParams.forEach(validateAddAccountParams);

      if (seedPhrase) {
        this.addSeedPhraseForce(seedPhrase);
      }

      this.addAccountsForce(accountParams);

      await this.saveData();
    });
  }

  async deleteAccounts(password: string, accUuids: string[]) {
    await this.verify(password);

    return withError(t("failedToDeleteWallets"), async () => {
      const accountsGroup = this.getGroup(Gr.Accounts);

      if (accUuids.length >= accountsGroup.entries.length) {
        throw new Error("Cannot delete all accounts");
      }

      for (const accUuid of accUuids) {
        const accEntry = this.getEntry(accountsGroup, accUuid);

        if (accEntry) {
          this.kdbx.remove(accEntry);
        }
      }

      await this.saveData();
    });
  }

  updateAccountName(accUuid: string, name: string) {
    return withError(t("failedToUpdateWalletName"), async () => {
      const accountsGroup = this.getGroup(Gr.Accounts);

      let accEntry: KdbxEntry | undefined;

      for (const entry of accountsGroup.entries) {
        if (entry.fields.get("name") === name) {
          throw new PublicError(t("walletNameAlreadyExists"));
        }

        if (entry.uuid.equals(accUuid)) {
          accEntry = entry;
        }
      }

      assert(accEntry, "Account not found");

      accEntry.fields.set("name", name);

      await this.saveData();
    });
  }

  // =============//
  // Account keys //
  // =============//

  getPublicKey(accUuid: string) {
    return withError(t("failedToFetchPublicKey"), () =>
      exportProtected(this.getKeyForce(accUuid, "publicKey"))
    );
  }

  sign(accUuid: string, digest: string) {
    return withError(t("failedToSign"), () => {
      const privKey = this.getKeyForce(accUuid, "privateKey");

      return signDigest(digest, privKey);
    });
  }

  signMessage(accUuid: string, standard: SigningStandard, data: any) {
    return withError(t("failedToSign"), () => {
      const privKeyProtected = this.getKeyForce(accUuid, "privateKey");

      const privateKey = Buffer.from(stripZeros(privKeyProtected.getText()));

      try {
        switch (standard) {
          case SigningStandard.PersonalSign:
            return personalSign({ data, privateKey });

          case SigningStandard.SignTypedDataV1:
            return signTypedData({
              version: SignTypedDataVersion.V1,
              data,
              privateKey,
            });

          case SigningStandard.SignTypedDataV3:
            return signTypedData({
              version: SignTypedDataVersion.V3,
              data: JSON.parse(data),
              privateKey,
            });

          case SigningStandard.SignTypedDataV4:
            return signTypedData({
              version: SignTypedDataVersion.V4,
              data: JSON.parse(data),
              privateKey,
            });

          default:
            throw null;
        }
      } finally {
        zeroBuffer(privateKey);
      }
    });
  }

  async getPrivateKey(password: string, accUuid: string) {
    await this.verify(password);

    return withError(t("failedToFetchPrivateKey"), () =>
      exportProtected(this.getKeyForce(accUuid, "privateKey"))
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
            const privateKey = add0x(
              importProtected(params.privateKey).getText()
            );
            const publicKey = ethers.utils.computePublicKey(privateKey, true);
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
            const privateKey = add0x(
              importProtected(params.privateKey).getText()
            );
            const publicKey = ethers.utils.computePublicKey(privateKey, true);
            const address = ethers.utils.computeAddress(publicKey);

            const { social, socialName, socialEmail } = params;

            const account: SocialAccount = {
              ...base,
              source,
              address,
              social,
              socialName,
              socialEmail,
            };

            const keys: AccountKeys = {
              privateKey: ProtectedValue.fromString(privateKey),
              publicKey: ProtectedValue.fromString(publicKey),
            };

            return { account, keys };
          }

          case AccountSource.Ledger: {
            const derivationPath = params.derivationPath;
            const publicKey = ethers.utils.computePublicKey(
              add0x(importProtected(params.publicKey).getText()),
              true
            );
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

    setFields(entry, {
      phrase: importProtected(seedPhrase.phrase),
      lang: seedPhrase.lang,
    });
  }

  private getKeyForce(accUuid: string, fieldName: string) {
    const entry = this.getEntry(Gr.AccountKeys, accUuid);
    assert(entry, "Account not found");

    const value = entry.fields.get(fieldName);
    assert(value instanceof ProtectedValue, "Field not found");

    return value;
  }

  private getSeedPhraseForce() {
    const entry = this.getSeedPhraseEntry();
    const seedPhrase = exportFields<SeedPharse>(entry);

    return seedPhrase;
  }

  private getSeedPhraseEntry() {
    const seedPhraseExists = this.isSeedPhraseExists();
    if (seedPhraseExists) {
      return this.getGroup(Gr.SeedPhrases).entries[0];
    }

    throw new PublicError(t("seedPhraseNotEstablished"));
  }

  private async verify(password: string) {
    return withError(t("invalidPassword"), async (getError) => {
      const hashToCheck = await importProtected(password).getHash();

      const localHash = arrayToBuffer(
        this.kdbx.credentials.passwordHash!.getBinary()
      );

      try {
        const matched = arrayBufferEquals(hashToCheck, localHash);

        await Vault.onPasswordUsage?.(matched);

        if (!matched) {
          throw getError();
        }
      } finally {
        zeroBuffer(hashToCheck);
        zeroBuffer(localHash);
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

async function signDigest(
  digest: BytesLike,
  privateKey: ProtectedValue
): Promise<Signature> {
  const privKey = stripZeros(privateKey.getText());

  const [sigHex, recoveryParam] = await secp256k1
    .sign(ethers.utils.arrayify(digest), privKey, { recovered: true })
    .finally(() => zeroBuffer(privKey));

  const signature = secp256k1.Signature.fromHex(sigHex);

  return splitSignature({
    recoveryParam,
    r: hexZeroPad("0x" + signature.r.toString(16), 32),
    s: hexZeroPad("0x" + signature.s.toString(16), 32),
  });
}
