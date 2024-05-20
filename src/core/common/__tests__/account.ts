import { toProtectedString } from "lib/crypto-utils";
import {
  validateAddAccountParams,
  validateName,
  validateNoAccountDuplicates,
} from "../account";
import { AccountSource } from "core/types";

const ROOT_PATH = "m/44'/60'/0'/0";
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

describe("Common > Wallet", () => {
  it("validateAddAccountParams > SeedPhrase", () => {
    expect(() => {
      validateAddAccountParams({
        name: "",
        source: AccountSource.SeedPhrase,
        derivationPath: TEST_WALLET.path,
      });
    }).toThrowError("Translated<invalidName>");

    expect(() => {
      validateAddAccountParams({
        name: TEST_WALLET.name,
        source: AccountSource.SeedPhrase,
        derivationPath: TEST_WALLET.path,
      });
    }).not.toThrow();

    expect(() => {
      validateAddAccountParams({
        name: TEST_WALLET.name,
        source: AccountSource.SeedPhrase,
        derivationPath: "",
      });
    }).toThrowError("Translated<invalidDerivationPath>");
  });

  it("validateAddAccountParams > Ledger", () => {
    expect(() => {
      validateAddAccountParams({
        name: TEST_WALLET.name,
        source: AccountSource.Ledger,
        derivationPath: TEST_WALLET.path,
        publicKey: "",
      });
    }).toThrowError("Translated<invalidPublicKey>");

    expect(() => {
      validateAddAccountParams({
        name: TEST_WALLET.name,
        source: AccountSource.Ledger,
        derivationPath: TEST_WALLET.path,
        publicKey: TEST_WALLET.publicKey,
      });
    }).toThrowError("Translated<invalidPublicKey>");

    expect(() => {
      validateAddAccountParams({
        name: TEST_WALLET.name,
        source: AccountSource.Ledger,
        derivationPath: TEST_WALLET.path,
        publicKey: toProtectedString(TEST_WALLET.publicKey),
      });
    }).not.toThrow();
  });

  it("validateAddAccountParams > OpenLogin", () => {
    expect(() => {
      validateAddAccountParams({
        name: TEST_WALLET.name,
        source: AccountSource.OpenLogin,
        privateKey: "asdasd",
        social: "reddit",
        socialName: "test name",
        socialEmail: "test@example.com",
      });
    }).toThrowError("Translated<invalidPrivateKey>");

    expect(() => {
      validateAddAccountParams({
        name: TEST_WALLET.name,
        source: AccountSource.OpenLogin,
        privateKey: toProtectedString(TEST_WALLET.privateKey),
        social: "reddit",
        socialName: "test name",
        socialEmail: "test@example.com",
      });
    }).not.toThrow();
  });

  it("validateAddAccountParams > PrivateKey", () => {
    expect(() => {
      validateAddAccountParams({
        name: TEST_WALLET.name,
        source: AccountSource.PrivateKey,
        privateKey: "asdasd",
      });
    }).toThrowError("Translated<invalidPrivateKey>");

    expect(() => {
      validateAddAccountParams({
        name: TEST_WALLET.name,
        source: AccountSource.PrivateKey,
        privateKey: toProtectedString(TEST_WALLET.privateKey),
      });
    }).not.toThrow();
  });

  it("validateNoAccountDuplicates", () => {
    expect(() =>
      validateNoAccountDuplicates([
        {
          name: "Test 1",
          source: AccountSource.SeedPhrase,
          derivationPath: TEST_WALLET.path,
          uuid: "uuid1",
          address: TEST_WALLET.address,
        },
        {
          name: "Test 2",
          source: AccountSource.SeedPhrase,
          derivationPath: TEST_WALLET.path,
          uuid: "uuid2",
          address: TEST_WALLET.address,
        },
      ]),
    ).toThrowError("Translated<walletAlreadyExists>");

    expect(() =>
      validateNoAccountDuplicates([
        {
          name: "Test 1",
          source: AccountSource.SeedPhrase,
          derivationPath: TEST_WALLET.path,
          uuid: "uuid1",
          address: TEST_WALLET.address,
        },
        {
          name: "Test 2",
          source: AccountSource.SeedPhrase,
          derivationPath: TEST_WALLET.path,
          uuid: "uuid1",
          address: TEST_WALLET.secondAddress,
        },
      ]),
    ).toThrowError("Translated<walletAlreadyExists>");

    expect(() =>
      validateNoAccountDuplicates([
        {
          name: "Test 1",
          source: AccountSource.SeedPhrase,
          derivationPath: TEST_WALLET.path,
          uuid: "uuid1",
          address: TEST_WALLET.address,
        },
        {
          name: "Test 2",
          source: AccountSource.SeedPhrase,
          derivationPath: TEST_WALLET.path,
          uuid: "uuid2",
          address: TEST_WALLET.secondAddress,
        },
      ]),
    ).not.toThrow();
  });

  it("validateName", () => {
    expect(() => validateName("")).toThrowError("Translated<invalidName>");

    expect(() => validateName(TEST_WALLET.name)).not.toThrow();
  });
});
