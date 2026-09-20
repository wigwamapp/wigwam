import { Transaction } from "ethers";

import { FeeSuggestions } from "core/types";

import { applyFeeSuggestion } from "../transaction";

const TO = "0x1ef41Ddcca2975Ce1F398D53788cF97aA7467402";

const BASE = {
  to: TO,
  nonce: 3,
  gasLimit: 21000n,
  value: 1n,
};

/** What bnb smart chain now produces: prices, with no tip to speak of */
const LEGACY_FEES: FeeSuggestions = {
  type: "legacy",
  modes: {
    low: { max: 50000000n },
    average: { max: 55000000n },
    high: { max: 60000000n },
  },
};

const MODERN_FEES: FeeSuggestions = {
  type: "modern",
  modes: {
    low: { max: 1100000000n, priority: 100000000n },
    average: { max: 1200000000n, priority: 200000000n },
    high: { max: 1250000000n, priority: 300000000n },
  },
};

describe("applyFeeSuggestion", () => {
  it("Strips the 1559 fields a legacy chain never asked for", () => {
    // `populateTransaction` types this as 1559 whenever the node reports any
    // base fee, zero included
    const tx = Transaction.from({
      ...BASE,
      chainId: 56,
      type: 2,
      maxFeePerGas: 60000000n,
      maxPriorityFeePerGas: 60000000n,
    }).clone();

    applyFeeSuggestion(tx, LEGACY_FEES, "average");

    expect(tx.type).toBe(0);
    expect(tx.gasPrice).toBe(55000000n);
    expect(tx.maxFeePerGas).toBeNull();
    expect(tx.maxPriorityFeePerGas).toBeNull();
    // A cloned 1559 tx carries an empty access list that a legacy one rejects
    expect(tx.accessList).toBeNull();
    expect(Transaction.from(tx).unsignedSerialized).toBeTruthy();
  });

  it("Serializes as a legacy transaction, tip included nowhere", () => {
    const tx = Transaction.from({ ...BASE, chainId: 56, type: 2 }).clone();

    applyFeeSuggestion(tx, LEGACY_FEES, "high");

    const parsed = Transaction.from(
      Transaction.from(tx).unsignedSerialized,
    ).toJSON() as any;

    expect(parsed.type).toBe(0);
    expect(parsed.gasPrice).toBe("60000000");
    expect(parsed.maxPriorityFeePerGas).toBeNull();
  });

  it("Keeps a real access list, as a berlin transaction", () => {
    const tx = Transaction.from({
      ...BASE,
      chainId: 56,
      type: 2,
      accessList: [{ address: TO, storageKeys: [] }],
    }).clone();

    applyFeeSuggestion(tx, LEGACY_FEES, "low");

    expect(tx.type).toBe(1);
    expect(tx.accessList).toHaveLength(1);
    expect(tx.gasPrice).toBe(50000000n);
    expect(Transaction.from(tx).unsignedSerialized.startsWith("0x01")).toBe(
      true,
    );
  });

  it("Applies 1559 caps on a chain with a base fee", () => {
    const tx = Transaction.from({
      ...BASE,
      chainId: 1,
      type: 0,
      gasPrice: 5n,
    }).clone();

    applyFeeSuggestion(tx, MODERN_FEES, "average");

    expect(tx.type).toBe(2);
    expect(tx.gasPrice).toBeNull();
    expect(tx.maxFeePerGas).toBe(1200000000n);
    expect(tx.maxPriorityFeePerGas).toBe(200000000n);
    expect(Transaction.from(tx).unsignedSerialized.startsWith("0x02")).toBe(
      true,
    );
  });
});
