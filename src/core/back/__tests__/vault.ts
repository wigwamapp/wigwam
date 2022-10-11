import { CryptoEngine } from "kdbxweb";
import { toProtectedString, fromProtectedString } from "lib/crypto-utils";
import { storage } from "lib/ext/storage";

import { AccountSource } from "core/types";

import { Vault } from "../vault";

// Mock profile prefix for storage usage
// It can work on its own, but web-extension-polyfill
// storage mock doesn't work in this scenario
jest.mock("lib/ext/profile", () => {
  const originalModule = jest.requireActual("lib/ext/profile");

  return {
    __esModule: true,
    ...originalModule,
    underProfile: async (key: string) => `test_${key}`,
    getProfileId: async () => "test",
  };
});

// Mock argon2 with sha256
beforeAll(() => CryptoEngine.setArgon2Impl((p) => CryptoEngine.sha256(p)));

// Clean storage after each test
afterEach(() => storage.clear());

const TEST_ADDRESS = "0x7efae4CDB551cD5cdd3715361e195eA7963E6738";

const TEST_WALLET = {
  name: "Test wallet",
  phrase:
    "kiwi opinion escape sea crop potato picture fiction onion social excess vital",
  path: "m/44'/60'/0'/0/0",
  address: "0xa37a58ED255089D9204125A0f3313826537759D9",
  privateKey:
    "0x91c90e34a6699a9b12272a18745b34533ecbbe94f7383524436a99bccd324619",
  publicKey:
    "0x040a9e012d5937956ca22110626e09ac8a058ae49b167eee94aaf5475f8dfd23e724e4644be26afb30a356c0e7d109ff55be38cbd12a085fd36cb6ea94761e81e1",
  publicKeyCompressed:
    "0x030a9e012d5937956ca22110626e09ac8a058ae49b167eee94aaf5475f8dfd23e7",
};

describe("Vault setup", () => {
  it("not exist by default", async () => {
    const isVaultExist = await Vault.isExist();

    expect(isVaultExist).toBe(false);
  });

  it("validate args basic", () => {
    expect(Vault.setup("123qweasd", [])).rejects.toThrowError(
      "Translated<failedToSetupWallet>"
    );

    expect(
      Vault.setup("", [
        {
          name: TEST_WALLET.name,
          source: AccountSource.Address,
          address: TEST_ADDRESS,
        },
      ])
    ).rejects.toThrowError("Translated<failedToSetupWallet>");
  });

  it("validate account name", () => {
    expect(
      Vault.setup("123qweasd", [
        {
          name: "",
          source: AccountSource.Address,
          address: TEST_ADDRESS,
        },
      ])
    ).rejects.toThrowError("Translated<invalidName>");
  });

  it("validate address", () => {
    expect(
      Vault.setup("123qweasd", [
        {
          name: TEST_WALLET.name,
          source: AccountSource.Address,
          address: "",
        },
      ])
    ).rejects.toThrowError("Translated<invalidAddress>");
  });

  it("validate address", () => {
    expect(
      Vault.setup("123qweasd", [
        {
          name: TEST_WALLET.name,
          source: AccountSource.Address,
          address: "",
        },
      ])
    ).rejects.toThrowError("Translated<invalidAddress>");

    expect(
      Vault.setup("123qweasd", [
        {
          name: TEST_WALLET.name,
          source: AccountSource.Address,
          address: "asdasdasd",
        },
      ])
    ).rejects.toThrowError("Translated<invalidAddress>");
  });

  it("create vault with watch-only account", () => {
    expect(
      Vault.setup("123qweasd", [
        {
          name: TEST_WALLET.name,
          source: AccountSource.Address,
          address: TEST_ADDRESS,
        },
      ])
    ).resolves.not.toThrow();
  });

  it("validate derivation path", () => {
    expect(
      Vault.setup("123qweasd", [
        {
          name: TEST_WALLET.name,
          source: AccountSource.SeedPhrase,
          derivationPath: "",
        },
      ])
    ).rejects.toThrowError("Translated<invalidDerivationPath>");
  });

  it("validate seed phrase existence", () => {
    expect(
      Vault.setup("123qweasd", [
        {
          name: TEST_WALLET.name,
          source: AccountSource.SeedPhrase,
          derivationPath: TEST_WALLET.path,
        },
      ])
    ).rejects.toThrowError("Translated<seedPhraseNotEstablished>");
  });

  it("validate seed phrase empty", () => {
    expect(
      Vault.setup(
        "123qweasd",
        [
          {
            name: TEST_WALLET.name,
            source: AccountSource.SeedPhrase,
            derivationPath: TEST_WALLET.path,
          },
        ],
        { lang: "en", phrase: "" }
      )
    ).rejects.toThrowError("Translated<seedPhraseIsNotValid>");
  });

  it("validate seed phrase protected", () => {
    expect(
      Vault.setup(
        "123qweasd",
        [
          {
            name: TEST_WALLET.name,
            source: AccountSource.SeedPhrase,
            derivationPath: TEST_WALLET.path,
          },
        ],
        { lang: "en", phrase: TEST_WALLET.phrase }
      )
    ).rejects.toThrowError("Translated<seedPhraseIsNotValid>");
  });

  it("validate seed phrase language", () => {
    expect(
      Vault.setup(
        "123qweasd",
        [
          {
            name: TEST_WALLET.name,
            source: AccountSource.SeedPhrase,
            derivationPath: TEST_WALLET.path,
          },
        ],
        { lang: "asd", phrase: TEST_WALLET.phrase }
      )
    ).rejects.toThrowError("Translated<seedPhraseLanguageNotSupported>");
  });

  it("create vault with secret phrase", () => {
    expect(
      Vault.setup(
        "123qweasd",
        [
          {
            name: TEST_WALLET.name,
            source: AccountSource.SeedPhrase,
            derivationPath: TEST_WALLET.path,
          },
        ],
        { lang: "en", phrase: toProtectedString(TEST_WALLET.phrase) }
      )
    ).resolves.not.toThrow();
  });

  it("create valid account with secret phrase", async () => {
    const vault = await Vault.setup(
      "123qweasd",
      [
        {
          name: TEST_WALLET.name,
          source: AccountSource.SeedPhrase,
          derivationPath: TEST_WALLET.path,
        },
      ],
      { lang: "en", phrase: toProtectedString(TEST_WALLET.phrase) }
    );

    const [acc] = vault.getAccounts();

    expect(acc.name).toBe(TEST_WALLET.name);
    expect(acc.source).toBe(AccountSource.SeedPhrase);
    expect(acc.derivationPath).toBe(TEST_WALLET.path);
    expect(acc.address).toBe(TEST_WALLET.address);
  });

  it("validate public key empty", () => {
    expect(
      Vault.setup("123qweasd", [
        {
          name: TEST_WALLET.name,
          source: AccountSource.Ledger,
          derivationPath: TEST_WALLET.path,
          publicKey: "",
        },
      ])
    ).rejects.toThrowError("Translated<invalidPublicKey>");
  });

  it("validate public key protected", () => {
    expect(
      Vault.setup("123qweasd", [
        {
          name: TEST_WALLET.name,
          source: AccountSource.Ledger,
          derivationPath: TEST_WALLET.path,
          publicKey: TEST_WALLET.publicKey,
        },
      ])
    ).rejects.toThrowError("Translated<invalidPublicKey>");
  });

  it("create vault with ledger account", () => {
    expect(
      Vault.setup("123qweasd", [
        {
          name: TEST_WALLET.name,
          source: AccountSource.Ledger,
          derivationPath: TEST_WALLET.path,
          publicKey: toProtectedString(TEST_WALLET.publicKey),
        },
      ])
    ).resolves.not.toThrow();
  });

  it("create valid ledger account", async () => {
    const vault = await Vault.setup("123qweasd", [
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

  it("create vault with open login account", () => {
    expect(
      Vault.setup("123qweasd", [
        {
          name: TEST_WALLET.name,
          source: AccountSource.OpenLogin,
          privateKey: toProtectedString(TEST_WALLET.privateKey),
          social: "reddit",
          socialName: "Test Reddit",
          socialEmail: "test@example.com",
        },
      ])
    ).resolves.not.toThrow();
  });
});
