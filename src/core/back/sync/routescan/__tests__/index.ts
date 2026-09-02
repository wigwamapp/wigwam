// Every import here is dynamic, so this marks the file as a module
export {};

jest.mock("axios", () => {
  const get = jest.fn();
  return { __esModule: true, default: { create: () => ({ get }), get } };
});

jest.mock("../../chain", () => ({
  getTokenMetadata: jest.fn(),
}));

type Routescan = typeof import("../index");

// The module caches NFT metadata, so every test gets a fresh copy of it and of
// the mocks that copy captured
let fetchAccountAssets: Routescan["fetchAccountAssets"];
let fetchAccountNFTs: Routescan["fetchAccountNFTs"];
let supportsRoutescan: Routescan["supportsRoutescan"];
let get: jest.Mock;
let metadata: jest.Mock;

const ADDR = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045";
const AVALANCHE = 43114;

const erc20 = {
  chainId: "43114",
  tokenAddress: "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7",
  tokenName: "TetherToken",
  tokenSymbol: "USDt",
  tokenDecimals: 6,
  tokenQuantity: "2002129",
  tokenPrice: "0.9997",
  tokenValueInUsd: "2.0015283613",
};

const erc721 = {
  tokenAddress: "0x0e11d8d829989085eED704295c4d3269746760eb",
  tokenId: "9772",
  collectionName: "ZKFAIR AIRDROP",
  collectionSymbol: "ZKFAIR",
};

const erc1155 = {
  tokenAddress: "0xd2bc8f9eAa96093b198B561afF05E0e14C171074",
  tokenId: "50",
  balance: "3",
};

/** Routescan splits NFTs across two endpoints, hit in a fixed order */
const answerNfts = (erc721s: unknown[], erc1155s: unknown[]) => {
  get.mockImplementation(async (url: string) =>
    url.includes("erc721-holdings")
      ? { data: { items: erc721s } }
      : { data: { items: erc1155s } },
  );
};

beforeEach(async () => {
  jest.resetModules();

  ({ fetchAccountAssets, fetchAccountNFTs, supportsRoutescan } = await import(
    "../index"
  ));

  get = (await import("axios")).default as unknown as jest.Mock;
  get = (get as unknown as { get: jest.Mock }).get;
  metadata = (await import("../../chain")).getTokenMetadata as jest.Mock;

  get.mockReset();
  metadata.mockReset();
  metadata.mockResolvedValue(null);
});

describe("routescan", () => {
  it("serves only the chains it indexes", () => {
    expect(supportsRoutescan(AVALANCHE)).toBe(true);
    expect(supportsRoutescan(137)).toBe(false);
  });

  it("refuses an unindexed chain instead of calling out", async () => {
    await expect(fetchAccountAssets(137, ADDR)).rejects.toThrow(
      "Chain not supported",
    );
    expect(get).not.toHaveBeenCalled();
  });

  it("maps erc20 holdings, prices included", async () => {
    get.mockResolvedValueOnce({ data: { items: [erc20] } });

    const [asset] = await fetchAccountAssets(AVALANCHE, ADDR);

    expect(get.mock.calls[0][0]).toBe(
      `/${AVALANCHE}/address/${ADDR}/erc20-holdings`,
    );
    expect(asset).toMatchObject({
      contract_address: erc20.tokenAddress,
      contract_ticker_symbol: "USDt",
      contract_decimals: 6,
      balance: "2002129",
      quote_rate: 0.9997,
      quote: 2.0015283613,
    });
  });

  it("keeps a missing price null rather than zero", async () => {
    get.mockResolvedValueOnce({
      data: { items: [{ ...erc20, tokenPrice: "0", tokenValueInUsd: null }] },
    });

    const [asset] = await fetchAccountAssets(AVALANCHE, ADDR);

    expect(asset.quote_rate).toBeNull();
    expect(asset.quote).toBeNull();
  });

  it("merges both nft standards and groups them by contract", async () => {
    answerNfts([erc721], [erc1155]);

    const collections = await fetchAccountNFTs(AVALANCHE, ADDR);

    expect(collections).toHaveLength(2);

    const [nft721] = collections[0].assets;
    expect(nft721).toMatchObject({
      token_id: "9772",
      erc_type: "erc721",
      // erc721 holdings carry no balance, one token is one item
      amount: "1",
    });

    const [nft1155] = collections[1].assets;
    expect(nft1155).toMatchObject({ erc_type: "erc1155", amount: "3" });
  });

  it("fills metadata in from the chain, since holdings carry none", async () => {
    metadata.mockResolvedValue({
      name: "Dropys #1",
      description: "desc",
      thumbnailUrl: "https://img",
      contentUrl: "https://content",
      contentType: "image_url",
      detailUrl: "https://detail",
      attributes: [{ trait_type: "a", value: "b" }],
    });
    answerNfts([erc721], []);

    const [collection] = await fetchAccountNFTs(AVALANCHE, ADDR);

    expect(collection.assets[0]).toMatchObject({
      name: "Dropys #1",
      image_uri: "https://img",
      content_uri: "https://content",
      external_link: "https://detail",
    });
  });

  it("caps the metadata calls but still passes every holding through", async () => {
    const many = Array.from({ length: 40 }, (_, i) => ({
      ...erc721,
      tokenId: String(i),
    }));
    answerNfts(many, []);

    const [collection] = await fetchAccountNFTs(AVALANCHE, ADDR);

    // Balances of NFTs already stored still refresh past the cap
    expect(collection.assets).toHaveLength(40);
    expect(metadata).toHaveBeenCalledTimes(30);
  });

  it("reuses metadata across syncs, but retries a miss", async () => {
    metadata.mockResolvedValueOnce(null); // first sync: gateway hiccup
    metadata.mockResolvedValue({ name: "Dropys #1" });
    answerNfts([erc721], []);

    await fetchAccountNFTs(AVALANCHE, ADDR);
    expect(metadata).toHaveBeenCalledTimes(1);

    // A miss is retried
    const [second] = await fetchAccountNFTs(AVALANCHE, ADDR);
    expect(metadata).toHaveBeenCalledTimes(2);
    expect(second.assets[0].name).toBe("Dropys #1");

    // A hit is not
    await fetchAccountNFTs(AVALANCHE, ADDR);
    expect(metadata).toHaveBeenCalledTimes(2);
  });

  it("survives a metadata lookup that throws", async () => {
    metadata.mockRejectedValue(new Error("rpc down"));
    answerNfts([erc721], []);

    const [collection] = await fetchAccountNFTs(AVALANCHE, ADDR);

    expect(collection.assets[0]).toMatchObject({ token_id: "9772" });
    expect(collection.assets[0].image_uri).toBeNull();
  });
});
