// Every import here is dynamic, so this marks the file as a module
export {};

// The mock factory is hoisted above imports, so the spy has to be born inside
// it and handed back through the mocked module
jest.mock("axios", () => {
  const get = jest.fn();
  return { __esModule: true, default: { create: () => ({ get }), get } };
});

jest.mock("core/common/network", () => ({
  getNetwork: async (chainId: number) => ({
    chainId,
    explorerApiUrl:
      chainId === 1
        ? "https://eth.blockscout.com/api"
        : "https://api.etherscan.io/v2/api?chainid=56",
  }),
}));

type FetchAccountAssets = typeof import("../index").fetchAccountAssets;

// The module remembers which chains have a broken v2, so every test gets a
// fresh copy of it — and of the axios spy the fresh copy captured
let fetchAccountAssets: FetchAccountAssets;
let get: jest.Mock;

const ADDR = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045";

const V2_URL = `https://eth.blockscout.com/api/v2/addresses/${ADDR}/token-balances`;
const V1_URL = "https://eth.blockscout.com/api";

const v2Token = {
  token: {
    address_hash: "0x1111111111111111111111111111111111111111",
    name: "Token",
    symbol: "TKN",
    decimals: "6",
    icon_url: "https://logo",
    exchange_rate: "2.5",
    type: "ERC-20",
  },
  value: "1000000",
};

const v1Tokens = [
  {
    contractAddress: "0x2222222222222222222222222222222222222222",
    name: "Old Token",
    symbol: "OLD",
    decimals: "8",
    balance: "500",
    type: "ERC-20",
  },
  // NFT rows share the endpoint and carry no decimals
  {
    contractAddress: "0x3333333333333333333333333333333333333333",
    name: "Pic",
    symbol: "PIC",
    decimals: "",
    balance: "1",
    type: "ERC-721",
  },
];

beforeEach(async () => {
  jest.resetModules();

  ({ fetchAccountAssets } = await import("../index"));

  const axios = (await import("axios")).default as unknown as {
    get: jest.Mock;
  };

  get = axios.get;
  get.mockReset();
});

describe("blockscout account assets", () => {
  it("reads v2 when the instance serves it", async () => {
    get.mockResolvedValueOnce({ data: [v2Token] });

    const assets = await fetchAccountAssets(1, ADDR);

    expect(get).toHaveBeenCalledTimes(1);
    expect(get.mock.calls[0][0]).toBe(V2_URL);
    expect(assets).toEqual([
      expect.objectContaining({
        contract_address: v2Token.token.address_hash,
        contract_ticker_symbol: "TKN",
        contract_decimals: 6,
        balance: "1000000",
        quote_rate: 2.5,
      }),
    ]);
  });

  it("falls back to the v1 tokenlist when v2 fails", async () => {
    get.mockRejectedValueOnce(new Error("Request failed with status code 500"));
    get.mockResolvedValueOnce({ data: { result: v1Tokens } });

    const assets = await fetchAccountAssets(1, ADDR);

    expect(get).toHaveBeenCalledTimes(2);
    expect(get.mock.calls[1][0]).toBe(V1_URL);
    expect(get.mock.calls[1][1].params).toMatchObject({
      module: "account",
      action: "tokenlist",
      address: ADDR,
    });

    // NFT row dropped, prices left for the dex sources to fill in
    expect(assets).toEqual([
      expect.objectContaining({
        contract_address: v1Tokens[0].contractAddress,
        contract_ticker_symbol: "OLD",
        contract_decimals: 8,
        balance: "500",
        quote_rate: null,
      }),
    ]);
  });

  it("stops retrying a broken v2 for a while", async () => {
    get.mockRejectedValueOnce(new Error("boom"));
    get.mockResolvedValue({ data: { result: v1Tokens } });

    await fetchAccountAssets(1, ADDR);
    expect(get).toHaveBeenCalledTimes(2);

    // Second run goes straight to v1, no wasted request at the broken api
    await fetchAccountAssets(1, ADDR);
    expect(get).toHaveBeenCalledTimes(3);
    expect(get.mock.calls[2][0]).toBe(V1_URL);
  });

  it("tolerates a rate-limit body instead of a list", async () => {
    get.mockRejectedValueOnce(new Error("boom"));
    get.mockResolvedValueOnce({
      data: { message: "Too many requests", result: null, status: "0" },
    });

    await expect(fetchAccountAssets(1, ADDR)).resolves.toEqual([]);
  });

  it("refuses chains served by a foreign explorer", async () => {
    await expect(fetchAccountAssets(56, ADDR)).rejects.toThrow(
      "Chain not supported",
    );
    expect(get).not.toHaveBeenCalled();
  });
});
