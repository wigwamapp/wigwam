// Every import here is dynamic, so this marks the file as a module
export {};

jest.mock("axios", () => {
  const get = jest.fn();
  return { __esModule: true, default: { get } };
});

jest.mock("lib/ext/storage", () => ({
  storage: { fetchForce: jest.fn(), put: jest.fn() },
}));

type Dapps = typeof import("../dapps");

// The module memoizes, so every test gets a fresh copy of it
let syncKnownDapps: Dapps["syncKnownDapps"];
let get: jest.Mock;
let fetchForce: jest.Mock;
let put: jest.Mock;

const DAY = 24 * 60 * 60_000;

/** The guard against a gutted response wants a plausible number of hosts */
const manyProtocols = (count = 600) =>
  Array.from({ length: count }, (_, i) => ({ url: `https://dapp${i}.xyz` }));

beforeEach(async () => {
  jest.resetModules();

  ({ syncKnownDapps } = await import("../dapps"));
  get = (await import("axios")).default.get as jest.Mock;
  ({ fetchForce, put } = (await import("lib/ext/storage")).storage as any);

  get.mockReset();
  fetchForce.mockReset();
  put.mockReset();
  fetchForce.mockResolvedValue(undefined);
});

describe("syncKnownDapps", () => {
  it("stores the hosts of the directory, not the megabytes of tvl data", async () => {
    get.mockResolvedValue({
      data: [
        { url: "https://app.uniswap.org/", tvl: 1, chains: ["Ethereum"] },
        { url: "https://www.ether.fi" },
        { url: null },
        { url: "not a url" },
        ...manyProtocols(),
      ],
    });

    await syncKnownDapps();

    const [key, value] = put.mock.calls[0];
    expect(key).toBe("known_dapps");
    expect(value.hosts).toContain("app.uniswap.org");
    expect(value.hosts).toContain("ether.fi");
    expect(value.hosts).toHaveLength(602);
    expect(value.fetchedAt).toBeCloseTo(Date.now(), -3);
  });

  it("keeps yesterday's list for a day instead of refetching", async () => {
    fetchForce.mockResolvedValue({
      hosts: ["app.uniswap.org"],
      fetchedAt: Date.now() - DAY / 2,
    });

    await syncKnownDapps();

    expect(get).not.toHaveBeenCalled();
    expect(put).not.toHaveBeenCalled();
  });

  it("refetches once the list is a day old", async () => {
    fetchForce.mockResolvedValue({
      hosts: ["app.uniswap.org"],
      fetchedAt: Date.now() - DAY - 1,
    });
    get.mockResolvedValue({ data: manyProtocols() });

    await syncKnownDapps();

    expect(get).toHaveBeenCalledTimes(1);
    expect(put).toHaveBeenCalledTimes(1);
  });

  // Concurrent calls collapse through `mem`, which the jest setup stubs out
  // globally, so that is not asserted here

  it("keeps the stored list when the directory answers with junk", async () => {
    get.mockResolvedValue({ data: [{ url: "https://only-one.xyz" }] });
    await syncKnownDapps();
    expect(put).not.toHaveBeenCalled();

    get.mockResolvedValue({ data: { error: "nope" } });
    await syncKnownDapps();
    expect(put).not.toHaveBeenCalled();
  });

  it("keeps the stored list when the request fails", async () => {
    get.mockRejectedValue(new Error("timeout"));

    await expect(syncKnownDapps()).resolves.toBeUndefined();
    expect(put).not.toHaveBeenCalled();
  });
});
