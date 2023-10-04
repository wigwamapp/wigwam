import { CryptoEngine } from "kdbxweb";
import { retrieveSession } from "lib/ext/safeSession";
import { recoverPersonalSignature } from "@metamask/eth-sig-util";
import { ethers } from "ethers";
import {
  toProtectedString,
  fromProtectedString,
  toProtectedPassword,
} from "lib/crypto-utils";
import { importProtected } from "lib/kdbx";
import { storage } from "lib/ext/storage";
import { session } from "lib/ext/session";

import { AccountSource, PASSWORD_SESSION, SigningStandard } from "core/types";

import { Vault } from "../vault";

// Mock argon2 with just sha256
beforeAll(() => CryptoEngine.setArgon2Impl((p) => CryptoEngine.sha256(p)));

// Clean storage after each test
afterEach(() => storage.clear());

const TEST_ADDRESS = "0x7efae4CDB551cD5cdd3715361e195eA7963E6738";
const TEST_PASSWORD = "123qweasd";
const ROOT_PATH = "m/44'/60'/0'/0";
const DIGESTS = [
  "0x164d2415e9ecb4cd123922612782f4baf65d382ef91c5f55ced5350a1ac02c35",
  "0x3982297279e970d69eeac68883dcb9167bf5b06ac70b53cff126cda47c9e9f0e",
  "0x52b3f03e33296d318bac267bd7fba4523f1d574a550f36babcbebaaaa4823bab",
  "0x66a1b231aa5d9bf7cff8e44ca706d9200aed0bd8a571bc1e5e71f95652bfbd90",
  "0x0e1993b495d504606ee65f8a69c73fca457572865d256631b206d815b9abc28e",
  "0x38c480a243adfca3ddae6690cab9ac9d4138eee46d350d17f72d18fa331331c9",
];

const TEST_WALLET = {
  name: "Test wallet",
  phrase:
    "kiwi opinion escape sea crop potato picture fiction onion social excess vital",
  path: `${ROOT_PATH}/0`,
  rootXpub:
    "xpub6ECj87ryBkA2LB3hAzt53KLed7qybT5SYM18C6V1edgeATHzAUrEbCn2S363vYUPRSKisEVYZf6JhRQpizKsURvfot4uuhYSRqtxT2NRqAQ",
  address: "0xa37a58ED255089D9204125A0f3313826537759D9",
  secondAddress: "0x5418382DaAf09Cfc4cFA5F65CEE2A0b6815B8e77",
  privateKey:
    "0x91c90e34a6699a9b12272a18745b34533ecbbe94f7383524436a99bccd324619",
  publicKey:
    "0x040a9e012d5937956ca22110626e09ac8a058ae49b167eee94aaf5475f8dfd23e724e4644be26afb30a356c0e7d109ff55be38cbd12a085fd36cb6ea94761e81e1",
  publicKeyCompressed:
    "0x030a9e012d5937956ca22110626e09ac8a058ae49b167eee94aaf5475f8dfd23e7",
};

const getPasswordHash = (password = TEST_PASSWORD) =>
  toProtectedPassword(password);

const createTestVault = async () => {
  const passHash = await getPasswordHash();
  const vault = await Vault.setup(
    passHash,
    [
      {
        name: TEST_WALLET.name,
        source: AccountSource.SeedPhrase,
        derivationPath: TEST_WALLET.path,
      },
    ],
    { lang: "en", phrase: toProtectedString(TEST_WALLET.phrase) },
  );

  return { vault, passHash };
};

describe("Vault", () => {
  it("not exist by default", async () => {
    const isVaultExist = await Vault.isExist();

    expect(isVaultExist).toBe(false);
  });

  it("validate args basic", () => {
    expect(Vault.setup(TEST_PASSWORD, [])).rejects.toThrowError(
      "Translated<failedToSetupWallet>",
    );

    expect(
      Vault.setup("", [
        {
          name: TEST_WALLET.name,
          source: AccountSource.Address,
          address: TEST_ADDRESS,
        },
      ]),
    ).rejects.toThrowError("Translated<failedToSetupWallet>");
  });

  it("validate account name", async () => {
    expect(
      Vault.setup(await getPasswordHash(), [
        {
          name: "",
          source: AccountSource.Address,
          address: TEST_ADDRESS,
        },
      ]),
    ).rejects.toThrowError("Translated<invalidName>");
  });

  it("validate address", async () => {
    expect(
      Vault.setup(await getPasswordHash(), [
        {
          name: TEST_WALLET.name,
          source: AccountSource.Address,
          address: "",
        },
      ]),
    ).rejects.toThrowError("Translated<invalidAddress>");
  });

  it("validate address", async () => {
    expect(
      Vault.setup(await getPasswordHash(), [
        {
          name: TEST_WALLET.name,
          source: AccountSource.Address,
          address: "",
        },
      ]),
    ).rejects.toThrowError("Translated<invalidAddress>");

    expect(
      Vault.setup(await getPasswordHash(), [
        {
          name: TEST_WALLET.name,
          source: AccountSource.Address,
          address: "asdasdasd",
        },
      ]),
    ).rejects.toThrowError("Translated<invalidAddress>");
  });

  it("create vault with watch-only account", async () => {
    expect(
      Vault.setup(await getPasswordHash(), [
        {
          name: TEST_WALLET.name,
          source: AccountSource.Address,
          address: TEST_ADDRESS,
        },
      ]),
    ).resolves.not.toThrow();
  });

  it("validate derivation path", async () => {
    expect(
      Vault.setup(await getPasswordHash(), [
        {
          name: TEST_WALLET.name,
          source: AccountSource.SeedPhrase,
          derivationPath: "",
        },
      ]),
    ).rejects.toThrowError("Translated<invalidDerivationPath>");
  });

  it("validate seed phrase existence", async () => {
    expect(
      Vault.setup(await getPasswordHash(), [
        {
          name: TEST_WALLET.name,
          source: AccountSource.SeedPhrase,
          derivationPath: TEST_WALLET.path,
        },
      ]),
    ).rejects.toThrowError("Translated<seedPhraseNotEstablished>");
  });

  it("validate seed phrase empty", async () => {
    expect(
      Vault.setup(
        await getPasswordHash(),
        [
          {
            name: TEST_WALLET.name,
            source: AccountSource.SeedPhrase,
            derivationPath: TEST_WALLET.path,
          },
        ],
        { lang: "en", phrase: "" },
      ),
    ).rejects.toThrowError("Translated<seedPhraseIsNotValid>");
  });

  it("validate seed phrase protected", async () => {
    expect(
      Vault.setup(
        await getPasswordHash(),
        [
          {
            name: TEST_WALLET.name,
            source: AccountSource.SeedPhrase,
            derivationPath: TEST_WALLET.path,
          },
        ],
        { lang: "en", phrase: TEST_WALLET.phrase },
      ),
    ).rejects.toThrowError("Translated<seedPhraseIsNotValid>");
  });

  it("validate seed phrase language", async () => {
    expect(
      Vault.setup(
        await getPasswordHash(),
        [
          {
            name: TEST_WALLET.name,
            source: AccountSource.SeedPhrase,
            derivationPath: TEST_WALLET.path,
          },
        ],
        { lang: "asd", phrase: TEST_WALLET.phrase },
      ),
    ).rejects.toThrowError("Translated<seedPhraseLanguageNotSupported>");
  });

  it("create vault with secret phrase", async () => {
    expect(
      Vault.setup(
        await getPasswordHash(),
        [
          {
            name: TEST_WALLET.name,
            source: AccountSource.SeedPhrase,
            derivationPath: TEST_WALLET.path,
          },
        ],
        { lang: "en", phrase: toProtectedString(TEST_WALLET.phrase) },
      ),
    ).resolves.not.toThrow();
  });

  it("create valid account with secret phrase", async () => {
    const vault = await Vault.setup(
      await getPasswordHash(),
      [
        {
          name: TEST_WALLET.name,
          source: AccountSource.SeedPhrase,
          derivationPath: TEST_WALLET.path,
        },
      ],
      { lang: "en", phrase: toProtectedString(TEST_WALLET.phrase) },
    );

    expect(vault.isSeedPhraseExists()).toBe(true);

    const [acc] = vault.getAccounts();

    expect(acc.name).toBe(TEST_WALLET.name);
    expect(acc.source).toBe(AccountSource.SeedPhrase);
    expect(acc.derivationPath).toBe(TEST_WALLET.path);
    expect(acc.address).toBe(TEST_WALLET.address);

    expect(
      importProtected(vault.getNeuterExtendedKey(ROOT_PATH)).getText(),
    ).toBe(TEST_WALLET.rootXpub);
  });

  it("validate public key empty", async () => {
    expect(
      Vault.setup(await getPasswordHash(), [
        {
          name: TEST_WALLET.name,
          source: AccountSource.Ledger,
          derivationPath: TEST_WALLET.path,
          publicKey: "",
        },
      ]),
    ).rejects.toThrowError("Translated<invalidPublicKey>");
  });

  it("validate public key protected", async () => {
    expect(
      Vault.setup(await getPasswordHash(), [
        {
          name: TEST_WALLET.name,
          source: AccountSource.Ledger,
          derivationPath: TEST_WALLET.path,
          publicKey: TEST_WALLET.publicKey,
        },
      ]),
    ).rejects.toThrowError("Translated<invalidPublicKey>");
  });

  it("create vault with ledger account", async () => {
    expect(
      Vault.setup(await getPasswordHash(), [
        {
          name: TEST_WALLET.name,
          source: AccountSource.Ledger,
          derivationPath: TEST_WALLET.path,
          publicKey: toProtectedString(TEST_WALLET.publicKey),
        },
      ]),
    ).resolves.not.toThrow();
  });

  it("create valid ledger account", async () => {
    const vault = await Vault.setup(await getPasswordHash(), [
      {
        name: TEST_WALLET.name,
        source: AccountSource.Ledger,
        derivationPath: TEST_WALLET.path,
        publicKey: toProtectedString(TEST_WALLET.publicKey),
      },
    ]);

    const [acc] = vault.getAccounts();
    expect(acc.address).toBe(TEST_WALLET.address);

    const pubKey = vault.getPublicKey(acc.uuid);
    expect(fromProtectedString(pubKey)).toBe(TEST_WALLET.publicKeyCompressed);
  });

  it("create vault with open login account", async () => {
    expect(
      Vault.setup(await getPasswordHash(), [
        {
          name: TEST_WALLET.name,
          source: AccountSource.OpenLogin,
          privateKey: toProtectedString(TEST_WALLET.privateKey),
          social: "reddit",
          socialName: "Test Reddit",
          socialEmail: "test@example.com",
        },
      ]),
    ).resolves.not.toThrow();
  });

  it("create vault with open login account", async () => {
    expect(
      Vault.setup(await getPasswordHash(), [
        {
          name: TEST_WALLET.name,
          source: AccountSource.OpenLogin,
          privateKey: toProtectedString(TEST_WALLET.privateKey),
          social: "reddit",
          socialName: "Test Reddit",
          socialEmail: "test@example.com",
        },
      ]),
    ).resolves.not.toThrow();
  });

  it("password session", async () => {
    const { vault, passHash } = await createTestVault();

    const sessionValue = await session.fetchForce(PASSWORD_SESSION);

    expect(sessionValue).not.toBeUndefined();
    expect(typeof sessionValue).toBe("string");
    expect(sessionValue).not.toBe(passHash);

    const passSession = await retrieveSession(PASSWORD_SESSION);
    expect(passSession).not.toBeNull();

    expect(passSession!.passwordHash).toBe(passHash);

    await vault.cleanup();
    expect(session.isStored(PASSWORD_SESSION)).resolves.toBe(false);
  });

  it("unlock", async () => {
    const { vault: vault1, passHash } = await createTestVault();

    await vault1.cleanup();

    const vault2 = await Vault.unlock(passHash);

    expect(vault1.getAccounts()).toStrictEqual(vault2.getAccounts());

    // Password session
    const sessionValue = await session.fetchForce(PASSWORD_SESSION);

    expect(sessionValue).not.toBeUndefined();
    expect(typeof sessionValue).toBe("string");
    expect(sessionValue).not.toBe(passHash);

    const passSession = await retrieveSession(PASSWORD_SESSION);
    expect(passSession).not.toBeNull();

    expect(passSession!.passwordHash).toBe(passHash);
  });

  it("changePassword", async () => {
    const passHashOld = await getPasswordHash();
    const passHashNew = await getPasswordHash("ghjtyu567");

    const vault1 = await Vault.setup(
      passHashOld,
      [
        {
          name: TEST_WALLET.name,
          source: AccountSource.SeedPhrase,
          derivationPath: TEST_WALLET.path,
        },
      ],
      { lang: "en", phrase: toProtectedString(TEST_WALLET.phrase) },
    );

    const accounts = vault1.getAccounts();

    await vault1.changePassword(passHashOld, passHashNew);
    await vault1.cleanup();

    expect(Vault.unlock(passHashOld)).rejects.toThrowError(
      "Translated<invalidPassword>",
    );

    const vault2 = await Vault.unlock(passHashNew);
    expect(vault2.getAccounts()).toStrictEqual(accounts);

    // Password session
    const sessionValue = await session.fetchForce(PASSWORD_SESSION);

    expect(sessionValue).not.toBeUndefined();
    expect(typeof sessionValue).toBe("string");
    expect(sessionValue).not.toBe(passHashNew);

    const passSession = await retrieveSession(PASSWORD_SESSION);
    expect(passSession).not.toBeNull();

    expect(passSession!.passwordHash).toBe(passHashNew);
  });

  it("deleteAccounts", async () => {
    const { vault, passHash } = await createTestVault();

    expect(vault.deleteAccounts("invalid_password", [])).rejects.toThrowError(
      "Translated<invalidPassword>",
    );

    const [acc] = vault.getAccounts();

    // Cannot delete all accounts
    await expect(
      vault.deleteAccounts(passHash, [acc.uuid]),
    ).rejects.toThrowError("Translated<failedToDeleteWallets>");

    expect(vault.getAccounts()).not.toStrictEqual([]);

    await vault.addAccounts([
      {
        name: "Test Wallet 2",
        source: AccountSource.SeedPhrase,
        derivationPath: `${ROOT_PATH}/1`,
      },
    ]);
    const [acc1, acc2] = vault.getAccounts();

    expect(acc2.address).toBe(TEST_WALLET.secondAddress);

    await expect(vault.deleteAccounts(passHash, [acc1.uuid])).resolves.toBe(
      undefined,
    );

    expect(vault.getAccounts()).toStrictEqual([acc2]);
  });

  it("updateAccountName", async () => {
    const { vault } = await createTestVault();
    const [acc] = vault.getAccounts();

    // Empty name
    await expect(vault.updateAccountName(acc.uuid, "")).rejects.toThrowError(
      "Translated<failedToUpdateWalletName>",
    );

    // Unknown account
    await expect(
      vault.updateAccountName("123123", "test name"),
    ).rejects.toThrowError("Translated<failedToUpdateWalletName>");

    // The same name
    await vault.addAccounts([
      {
        name: "Test Wallet 2",
        source: AccountSource.SeedPhrase,
        derivationPath: `${ROOT_PATH}/1`,
      },
    ]);
    await expect(
      vault.updateAccountName(acc.uuid, "Test Wallet 2"),
    ).rejects.toThrowError("Translated<walletNameAlreadyExists>");

    // Just works
    await expect(
      vault.updateAccountName(acc.uuid, "Test Wallet 1"),
    ).resolves.toBe(undefined);

    const [acc1, acc2] = vault.getAccounts();
    expect([acc1.name, acc2.name]).toStrictEqual([
      "Test Wallet 1",
      "Test Wallet 2",
    ]);
  });

  it("getPublicKey", async () => {
    const { vault } = await createTestVault();

    // Unknown account
    expect(() => vault.getPublicKey("123123")).toThrowError(
      "Translated<failedToFetchPublicKey>",
    );

    const [acc] = vault.getAccounts();
    expect(
      importProtected(vault.getPublicKey(acc.uuid)).getText(),
    ).toStrictEqual(TEST_WALLET.publicKeyCompressed);
  });

  it("getPrivateKey", async () => {
    const { vault, passHash } = await createTestVault();

    const [acc] = vault.getAccounts();

    // Invalid password
    expect(vault.getPrivateKey("asdasd", acc.uuid)).rejects.toThrowError(
      "Translated<invalidPassword>",
    );

    // Unknown account
    expect(vault.getPrivateKey(passHash, "123123")).rejects.toThrowError(
      "Translated<failedToFetchPrivateKey>",
    );

    const privKeyProtected = await vault.getPrivateKey(passHash, acc.uuid);

    expect(importProtected(privKeyProtected).getText()).toStrictEqual(
      TEST_WALLET.privateKey,
    );
  });

  it("signDigest", async () => {
    const { vault } = await createTestVault();

    // Unknown account
    expect(vault.sign("123123", DIGESTS[0])).rejects.toThrowError(
      "Translated<failedToSign>",
    );

    const [acc] = vault.getAccounts();

    expect(vault.sign(acc.uuid, "0x1234")).rejects.toThrowError(
      "Translated<failedToSign>",
    );

    expect(await vault.sign(acc.uuid, DIGESTS[0])).toMatchSnapshot();

    expect(await vault.sign(acc.uuid, DIGESTS[1])).toMatchSnapshot();
    expect(await vault.sign(acc.uuid, DIGESTS[2])).toMatchSnapshot();
    expect(await vault.sign(acc.uuid, DIGESTS[3])).toMatchSnapshot();
    expect(await vault.sign(acc.uuid, DIGESTS[4])).toMatchSnapshot();
    expect(await vault.sign(acc.uuid, DIGESTS[5])).toMatchSnapshot();
  });

  it("signMessage basic", async () => {
    const { vault } = await createTestVault();

    // Unknown account
    expect(() =>
      vault.signMessage("123123", SigningStandard.PersonalSign, "0x1234"),
    ).toThrowError("Translated<failedToSign>");

    const [acc] = vault.getAccounts();

    // Unsupported standard
    expect(() =>
      vault.signMessage(acc.uuid, SigningStandard.EthSign, "0x1234"),
    ).toThrowError("Translated<failedToSign>");

    const psData = `0x${Buffer.from("Hello, world!").toString("hex")}`;
    const psSignature = vault.signMessage(
      acc.uuid,
      SigningStandard.PersonalSign,
      psData,
    );

    expect(psSignature).toMatchSnapshot();

    expect(
      ethers.getAddress(
        recoverPersonalSignature({ signature: psSignature, data: psData }),
      ),
    ).toStrictEqual(acc.address);
  });

  it("signTypedMessage", async () => {
    const { vault } = await createTestVault();

    const [acc] = vault.getAccounts();

    expect(
      vault.signMessage(acc.uuid, SigningStandard.SignTypedDataV1, [
        {
          type: "string",
          name: "Message",
          value: "Hi, Alice!",
        },
        {
          type: "uint32",
          name: "A number",
          value: "1337",
        },
      ]),
    ).toMatchSnapshot();

    expect(
      vault.signMessage(
        acc.uuid,
        SigningStandard.SignTypedDataV3,
        JSON.stringify({
          types: {
            EIP712Domain: [
              {
                name: "name",
                type: "string",
              },
              {
                name: "version",
                type: "string",
              },
              {
                name: "chainId",
                type: "uint256",
              },
              {
                name: "verifyingContract",
                type: "address",
              },
            ],
            Person: [
              {
                name: "name",
                type: "string",
              },
              {
                name: "wallet",
                type: "address",
              },
            ],
            Mail: [
              {
                name: "from",
                type: "Person",
              },
              {
                name: "to",
                type: "Person",
              },
              {
                name: "contents",
                type: "string",
              },
            ],
          },
          primaryType: "Mail",
          domain: {
            name: "Ether Mail",
            version: "1",
            chainId: 1,
            verifyingContract: "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC",
          },
          message: {
            from: {
              name: "Cow",
              wallet: "0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826",
            },
            to: {
              name: "Bob",
              wallet: "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB",
            },
            contents: "Hello, Bob!",
          },
        }),
      ),
    ).toMatchSnapshot();

    expect(
      vault.signMessage(
        acc.uuid,
        SigningStandard.SignTypedDataV4,
        JSON.stringify({
          domain: {
            chainId: "1",
            name: "Ether Mail",
            verifyingContract: "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC",
            version: "1",
          },
          message: {
            contents: "Hello, Bob!",
            from: {
              name: "Cow",
              wallets: [
                "0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826",
                "0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF",
              ],
            },
            to: [
              {
                name: "Bob",
                wallets: [
                  "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB",
                  "0xB0BdaBea57B0BDABeA57b0bdABEA57b0BDabEa57",
                  "0xB0B0b0b0b0b0B000000000000000000000000000",
                ],
              },
            ],
          },
          primaryType: "Mail",
          types: {
            EIP712Domain: [
              {
                name: "name",
                type: "string",
              },
              {
                name: "version",
                type: "string",
              },
              {
                name: "chainId",
                type: "uint256",
              },
              {
                name: "verifyingContract",
                type: "address",
              },
            ],
            Group: [
              {
                name: "name",
                type: "string",
              },
              {
                name: "members",
                type: "Person[]",
              },
            ],
            Mail: [
              {
                name: "from",
                type: "Person",
              },
              {
                name: "to",
                type: "Person[]",
              },
              {
                name: "contents",
                type: "string",
              },
            ],
            Person: [
              {
                name: "name",
                type: "string",
              },
              {
                name: "wallets",
                type: "address[]",
              },
            ],
          },
        }),
      ),
    ).toMatchSnapshot();
  });
});
