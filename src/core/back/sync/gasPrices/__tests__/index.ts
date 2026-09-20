import { getRpcProvider } from "../../../rpc";
import { getFeeHistoryGasPrices } from "../feeHistory";
import { getOnChainLegacy } from "../onChainLegacy";
import { resolveFeeType } from "../feeType";
import { buildLegacyModes, buildModernModes } from "../modes";

jest.mock("../../../rpc", () => {
  const provider = {
    send: jest.fn(),
    getFeeData: jest.fn(),
    getBlock: jest.fn(),
  };

  return { getRpcProvider: () => provider };
});

const { send, getFeeData, getBlock } = getRpcProvider(1) as any;

const GWEI = 10n ** 9n;

/** Real numbers: no base fee, every tip at the 0.05 gwei validator minimum */
const BSC_FEE_HISTORY = {
  oldestBlock: "0x7548605",
  baseFeePerGas: Array(11).fill("0x0"),
  reward: Array(10).fill(["0x2faf080", "0x2faf080", "0x2faf080"]),
  gasUsedRatio: Array(10).fill(0.3),
};

const ETH_FEE_HISTORY = {
  oldestBlock: "0x1",
  baseFeePerGas: Array(11).fill("0x3b9aca00"), // 1 gwei
  reward: Array(10).fill(["0x5f5e100", "0xbebc200", "0x11e1a300"]),
  gasUsedRatio: Array(10).fill(0.5),
};

beforeEach(() => {
  send.mockReset();
  getFeeData.mockReset();
  getBlock.mockReset();
});

describe("resolveFeeType", () => {
  it("Keeps bnb smart chain legacy whatever an rpc reports", () => {
    expect(resolveFeeType(56, 0n)).toBe("legacy");
    expect(resolveFeeType(56, GWEI)).toBe("legacy");
    expect(resolveFeeType(97, GWEI)).toBe("legacy");
  });

  it("Treats a chain without a base fee as legacy", () => {
    expect(resolveFeeType(1, 0n)).toBe("legacy");
    expect(resolveFeeType(1, null)).toBe("legacy");
  });

  it("Keeps a chain with a base fee modern", () => {
    expect(resolveFeeType(1, GWEI)).toBe("modern");
  });
});

describe("buildLegacyModes", () => {
  const prices = { low: 1n * GWEI, average: 2n * GWEI, high: 3n * GWEI };

  it("Prices by mode, with no cap head-room", () => {
    expect(buildLegacyModes(prices, null)).toStrictEqual({
      low: { max: (1n * GWEI).toString() },
      average: { max: (2n * GWEI).toString() },
      high: { max: (3n * GWEI).toString() },
    });
  });

  it("Lifts a mode priced under what the node suggests", () => {
    expect(buildLegacyModes(prices, 4n * GWEI)).toStrictEqual({
      low: { max: (4n * GWEI).toString() },
      average: { max: ((44n * GWEI) / 10n).toString() },
      high: { max: ((48n * GWEI) / 10n).toString() },
    });
  });
});

describe("getFeeHistoryGasPrices", () => {
  it("Sends a gas price, not a tip, on bnb smart chain", async () => {
    send.mockImplementation((method: string) =>
      method === "eth_feeHistory" ? BSC_FEE_HISTORY : "0x2faf080",
    );

    const gasPrices = (await getFeeHistoryGasPrices(56))!;

    expect(gasPrices.type).toBe("legacy");
    expect(gasPrices.modes.low).toStrictEqual({ max: "50000000" });
    expect(gasPrices.modes.average).not.toHaveProperty("priority");
    // The same price the chain charges, only spelled the way it prices
    expect(BigInt(gasPrices.modes.high.max)).toBe(60000000n);
  });

  it("Keeps eip-1559 caps on a chain with a base fee", async () => {
    send.mockImplementation((method: string) =>
      method === "eth_feeHistory" ? ETH_FEE_HISTORY : "0x3b9aca00",
    );

    const gasPrices = (await getFeeHistoryGasPrices(1))!;

    expect(gasPrices.type).toBe("modern");
    expect(gasPrices.modes.low).toStrictEqual({
      max: (multiplyBase(11n, 10n) + 100000000n).toString(),
      priority: "100000000",
    });
  });
});

describe("getOnChainLegacy", () => {
  it("Ignores a priority fee suggested by a chain without a base fee", async () => {
    getFeeData.mockResolvedValue({
      gasPrice: 50000000n,
      maxPriorityFeePerGas: 50000000n,
    });
    getBlock.mockResolvedValue({ baseFeePerGas: 0n });

    const gasPrices = (await getOnChainLegacy(56))!;

    expect(gasPrices.type).toBe("legacy");
    expect(gasPrices.modes.low).toStrictEqual({ max: "50000000" });
  });

  it("Shapes modes from the tip when a base fee exists", async () => {
    getFeeData.mockResolvedValue({
      gasPrice: 2n * GWEI,
      maxPriorityFeePerGas: 1n * GWEI,
    });
    getBlock.mockResolvedValue({ baseFeePerGas: 1n * GWEI });

    const gasPrices = (await getOnChainLegacy(1))!;

    expect(gasPrices.type).toBe("modern");
    expect(gasPrices.modes.high).toHaveProperty("priority");
  });
});

describe("buildModernModes", () => {
  it("Raises the tip with the cap when the node floor applies", () => {
    const tips = { low: 0n, average: 0n, high: 0n };
    const modes = buildModernModes(0n, tips, GWEI);

    // A cap lifted over a base fee of zero is a tip in everything but name,
    // which is exactly what the legacy shaping exists to avoid
    expect(modes.average).toStrictEqual({
      max: ((11n * GWEI) / 10n).toString(),
      priority: ((11n * GWEI) / 10n).toString(),
    });
  });
});

function multiplyBase(num: bigint, den: bigint) {
  return (GWEI * num) / den;
}
