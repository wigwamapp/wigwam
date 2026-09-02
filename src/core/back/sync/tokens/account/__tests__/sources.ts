jest.mock("../../../blockscout", () => ({
  fetchAccountAssets: jest.fn(),
  fetchAccountNFTs: jest.fn(),
  supportsBlockscout: jest.fn(),
}));

jest.mock("../../../routescan", () => ({
  fetchAccountAssets: jest.fn(),
  fetchAccountNFTs: jest.fn(),
  supportsRoutescan: jest.fn(),
}));

jest.mock("core/common/walletConnectApi", () => ({
  isWcApiEnabled: jest.fn(() => false),
  fetchWcAccountBalance: jest.fn(),
  parseWcAssetAddress: (address: string) => address,
}));

import {
  isWcApiEnabled,
  fetchWcAccountBalance,
} from "core/common/walletConnectApi";

import * as blockscout from "../../../blockscout";
import * as routescan from "../../../routescan";
import { fetchAccountAssets } from "../assetSources";
import { fetchAccountNFTs } from "../nftSources";

const bsAssets = blockscout.fetchAccountAssets as jest.Mock;
const rsAssets = routescan.fetchAccountAssets as jest.Mock;
const bsNfts = blockscout.fetchAccountNFTs as jest.Mock;
const rsNfts = routescan.fetchAccountNFTs as jest.Mock;
const bsServes = blockscout.supportsBlockscout as jest.Mock;
const rsServes = routescan.supportsRoutescan as jest.Mock;
const wcEnabled = isWcApiEnabled as jest.Mock;
const wcBalance = fetchWcAccountBalance as jest.Mock;

const ADDR = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045";
const CHAIN = 43114;

const asset = { contract_address: "0x1", balance: "1" };
const collection = { contract_address: "0x2", assets: [{ token_id: "1" }] };

beforeEach(() => {
  jest.clearAllMocks();
  wcEnabled.mockReturnValue(false);
  bsServes.mockResolvedValue(true);
  rsServes.mockReturnValue(true);
});

describe("asset sources", () => {
  it("stops at the first source with data", async () => {
    bsAssets.mockResolvedValue([asset]);

    await expect(fetchAccountAssets(CHAIN, ADDR)).resolves.toEqual([asset]);
    expect(rsAssets).not.toHaveBeenCalled();
  });

  it("moves on when a source serves the chain but finds nothing", async () => {
    bsAssets.mockResolvedValue([]);
    rsAssets.mockResolvedValue([asset]);

    await expect(fetchAccountAssets(CHAIN, ADDR)).resolves.toEqual([asset]);
  });

  it("skips a source that does not serve the chain", async () => {
    bsServes.mockResolvedValue(false);
    rsAssets.mockResolvedValue([asset]);

    await expect(fetchAccountAssets(CHAIN, ADDR)).resolves.toEqual([asset]);
    expect(bsAssets).not.toHaveBeenCalled();
  });

  it("reports a failure when every serving source fails", async () => {
    bsAssets.mockRejectedValue(new Error("500"));
    rsAssets.mockRejectedValue(new Error("429"));

    await expect(fetchAccountAssets(CHAIN, ADDR)).rejects.toThrow("429");
  });

  it("returns empty when the sources agree the account holds nothing", async () => {
    bsAssets.mockResolvedValue([]);
    rsAssets.mockResolvedValue([]);

    await expect(fetchAccountAssets(CHAIN, ADDR)).resolves.toEqual([]);
  });

  it("errors when no source serves the chain at all", async () => {
    bsServes.mockResolvedValue(false);
    rsServes.mockReturnValue(false);

    await expect(fetchAccountAssets(CHAIN, ADDR)).rejects.toThrow(
      "Chain not supported",
    );
    expect(bsAssets).not.toHaveBeenCalled();
    expect(rsAssets).not.toHaveBeenCalled();
  });

  it("leads with walletconnect only when it is configured", async () => {
    wcEnabled.mockReturnValue(true);
    wcBalance.mockResolvedValue([
      {
        address: "0x9",
        quantity: { decimals: 6, numeric: "1.5" },
        symbol: "USDC",
        name: "USD Coin",
        price: 1,
        value: 1.5,
      },
    ]);

    const assets = await fetchAccountAssets(CHAIN, ADDR);

    expect(assets).toHaveLength(1);
    expect(assets[0]).toMatchObject({ contract_ticker_symbol: "USDC" });
    expect(bsAssets).not.toHaveBeenCalled();
  });

  it("treats an empty walletconnect answer as no data, not no balance", async () => {
    wcEnabled.mockReturnValue(true);
    wcBalance.mockResolvedValue([]);
    bsAssets.mockResolvedValue([asset]);

    await expect(fetchAccountAssets(CHAIN, ADDR)).resolves.toEqual([asset]);
  });
});

describe("nft sources", () => {
  it("prefers blockscout, which ships metadata", async () => {
    bsNfts.mockResolvedValue([collection]);

    await expect(fetchAccountNFTs(CHAIN, ADDR)).resolves.toEqual([collection]);
    expect(rsNfts).not.toHaveBeenCalled();
  });

  it("falls back to routescan on chains blockscout does not serve", async () => {
    bsServes.mockResolvedValue(false);
    rsNfts.mockResolvedValue([collection]);

    await expect(fetchAccountNFTs(CHAIN, ADDR)).resolves.toEqual([collection]);
  });

  it("reports a failure when every serving source fails", async () => {
    bsNfts.mockRejectedValue(new Error("500"));
    rsNfts.mockRejectedValue(new Error("429"));

    await expect(fetchAccountNFTs(CHAIN, ADDR)).rejects.toThrow("429");
  });

  it("errors when no source serves the chain, so stored NFTs are not pruned", async () => {
    bsServes.mockResolvedValue(false);
    rsServes.mockReturnValue(false);

    await expect(fetchAccountNFTs(CHAIN, ADDR)).rejects.toThrow(
      "Chain not supported",
    );
  });
});
