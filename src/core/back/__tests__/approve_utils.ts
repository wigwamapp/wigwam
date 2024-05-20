import { AccountSource, HDAccount, WatchOnlyAccount } from "core/types";

import {
  getAccountSafe,
  parseTxSafe,
  validateTxOrigin,
  STRICT_TX_PROPS,
} from "../approve/utils";
import { accountsUpdated } from "../state";
import { ethers } from "ethers";

describe("getAccountSafe", () => {
  const TEST_ACC_1: WatchOnlyAccount = {
    uuid: "test-1",
    name: "Test Account 1",
    source: AccountSource.Address,
    address: "0x1ef41Ddcca2975Ce1F398D53788cF97aA7467402",
  };
  const TEST_ACC_2: HDAccount = {
    uuid: "test-2",
    name: "Test Account 2",
    source: AccountSource.SeedPhrase,
    address: "0xa37a58ED255089D9204125A0f3313826537759D9",
    derivationPath: "m/44'/60'/0'/0/0",
  };

  beforeAll(() => {
    accountsUpdated([TEST_ACC_1, TEST_ACC_2]);
  });

  it("Throws when watch-only account", () => {
    expect(() => getAccountSafe(TEST_ACC_1.address)).toThrowError();
  });

  it("Throws when undefined account", () => {
    expect(() =>
      getAccountSafe("0x9d08f30B376F86f182E89e4743691f9a34458b43"),
    ).toThrowError("Account not found");
  });

  it("Throws when invalid account", () => {
    expect(() => getAccountSafe("0x1232323")).toThrowError();
  });

  it("Resolve account", () => {
    expect(getAccountSafe(TEST_ACC_2.address)).toStrictEqual(TEST_ACC_2);
  });
});

describe("parseTxSafe", () => {
  it("parseTx", () => {
    expect(
      // Unsigned EIP155 tx
      parseTxSafe(
        "0xf85d82028882237e819d946eb893e3466931517a04a17d153a6330c3f2f1dd82c854b5889e365e59664fb881554ba1175519b5195b1d20390beb806d8f2cda7893e6f79848195dba4c905db6d7257ffb5eefea35f18ae33c848404bf1f8080",
      ),
    ).toMatchSnapshot();
  });

  it("remove sig", () => {
    // Signed London tx
    const tx = parseTxSafe(
      "0x02f8a5848404bf1f820288832c7e6384346d9246819d946eb893e3466931517a04a17d153a6330c3f2f1dd82c854b5889e365e59664fb881554ba1175519b5195b1d20390beb806d8f2cda7893e6f79848195dba4c905db6d7257ffb5eefea35f18ae33cc080a0f1003f96c6c6620dd46db36d2ae9f12d363947eb0db088c678b6ad1cf494aa6fa06085b5abbf448de5d622dc820da590cfdb6bb77b41c6650962b998a941f8d701",
    );

    expect(tx).toMatchSnapshot();
    expect(tx.signature).toBe(null);
  });
});

describe("validateTxOrigin", () => {
  for (const prop of STRICT_TX_PROPS) {
    it(`throw when ${prop} different`, () => {
      expect(() =>
        validateTxOrigin(
          ethers.Transaction.from(
            "0x02f862848404bf1f820288832c7e6384346d9246819d946eb893e3466931517a04a17d153a6330c3f2f1dd82c854b5889e365e59664fb881554ba1175519b5195b1d20390beb806d8f2cda7893e6f79848195dba4c905db6d7257ffb5eefea35f18ae33cc0",
          ),
          {
            to:
              prop !== "to"
                ? "0x6eb893e3466931517a04a17d153a6330c3f2f1dd"
                : "0x801040E2965D0cf9d73FEe4ccc8eEA9eeBbC491e",
            nonce: 648,
            gasLimit: "0x9d",
            from: "0x801040E2965D0cf9d73FEe4ccc8eEA9eeBbC491e",
            gasPrice: "0x237e",
            maxFeePerGas: "0x346d9246",
            maxPriorityFeePerGas: "0x2c7e63",
            data:
              prop !== "data"
                ? "0x889e365e59664fb881554ba1175519b5195b1d20390beb806d8f2cda7893e6f79848195dba4c905db6d7257ffb5eefea35f18ae33c"
                : "0x00",
            value: prop !== "value" ? "0xc854" : "0x00",
            accessList:
              prop !== "accessList" ? [] : [{ address: "", storageKeys: [] }],
            chainId: prop !== "chainId" ? "0x8404bf1f" : "0x123",
          },
        ),
      ).toThrow("Invalid transaction");
    });
  }

  it("not throw when everything ok", () => {
    expect(() =>
      validateTxOrigin(
        ethers.Transaction.from(
          "0x02f862848404bf1f820288832c7e6384346d9246819d946eb893e3466931517a04a17d153a6330c3f2f1dd82c854b5889e365e59664fb881554ba1175519b5195b1d20390beb806d8f2cda7893e6f79848195dba4c905db6d7257ffb5eefea35f18ae33cc0",
        ),
        {
          to: "0x6eb893e3466931517a04a17d153a6330c3f2f1dd",
          nonce: 648,
          gasLimit: "0x9d",
          from: "0x801040E2965D0cf9d73FEe4ccc8eEA9eeBbC491e",
          gasPrice: "0x237e",
          maxFeePerGas: "0x346d9246",
          maxPriorityFeePerGas: "0x2c7e63",
          data: "0x889e365e59664fb881554ba1175519b5195b1d20390beb806d8f2cda7893e6f79848195dba4c905db6d7257ffb5eefea35f18ae33c",
          value: "0xc854",
          accessList: [],
          chainId: "0x8404bf1f",
        },
      ),
    ).not.toThrow();
  });
});
