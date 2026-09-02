import { AccountAsset, TokenStatus, TokenType } from "core/types";
import { NATIVE_TOKEN_SLUG } from "core/common/tokens";

import { INITIAL_SYNC_CHAIN_IDS, syncNetworks } from "../networks";

/** Rows the fake repo holds, standing in for stored native tokens */
let db: AccountAsset[] = [];
/** Balance a chain answers with; `null` stands for an unreachable RPC */
const balances = new Map<number, bigint | null>();
/** Chains a run actually asked for a balance */
let probed: number[] = [];

const KNOWN_CHAIN_IDS = [...INITIAL_SYNC_CHAIN_IDS, 42220 /* celo */];

jest.mock("core/repo", () => ({
  accountTokens: {
    where: () => ({ equals: () => ({ toArray: async () => [...db] }) }),
    bulkPut: async (records: AccountAsset[]) => {
      for (const record of records) {
        const i = db.findIndex((t) => t.chainId === record.chainId);
        if (i >= 0) db[i] = record;
        else db.push(record);
      }
    },
    bulkDelete: async (keys: string[]) => {
      const chainIds = keys.map((key) => Number(key.split("_")[0]));
      db = db.filter((t) => !chainIds.includes(t.chainId));
    },
  },
  networks: {
    toArray: async () => KNOWN_CHAIN_IDS.map((chainId) => ({ chainId })),
  },
}));

jest.mock("core/common/network", () => ({
  getNetwork: async (chainId: number) => ({
    chainId,
    chainTag: `chain-${chainId}`,
    nativeCurrency: { symbol: "SYM", name: "Name", decimals: 18 },
  }),
  isNetworkWithEthToken: () => false,
}));

jest.mock("../../dexPrices", () => ({
  getNativeTokenPrice: async () => ({ usd: 1 }),
}));

jest.mock("../../chain", () => ({
  getBalanceFromChain: async (chainId: number) => {
    probed.push(chainId);
    return balances.has(chainId) ? balances.get(chainId) : 0n;
  },
}));

const ONE = 10n ** 18n;

const storedChainIds = () => db.map((t) => t.chainId).sort((a, b) => a - b);
const probedChainIds = () => [...probed].sort((a, b) => a - b);

const seed = (chainId: number, rawBalance: string, portfolioUSD = "0") => {
  db.push({
    chainId,
    accountAddress: "acc",
    tokenSlug: NATIVE_TOKEN_SLUG,
    tokenType: TokenType.Asset,
    status: TokenStatus.Native,
    decimals: 18,
    name: "name",
    symbol: "sym",
    rawBalance,
    balanceUSD: 0,
    portfolioUSD,
  } as AccountAsset);
};

// syncNetworks is memoized per (address, chainId) for 10s, so every call in
// this suite uses a fresh address
let accountCounter = 0;
const nextAccount = () => `acc-${accountCounter++}`;

beforeEach(() => {
  db = [];
  probed = [];
  balances.clear();
});

describe("syncNetworks", () => {
  it("probes the whitelist on the first sync, keeps funded chains and the active one", async () => {
    balances.set(137, 5n * ONE);

    const result = await syncNetworks(nextAccount(), 1);

    expect(probedChainIds()).toEqual(
      [...INITIAL_SYNC_CHAIN_IDS].sort((a, b) => a - b),
    );
    // Active chain is kept at a zero balance, the other empty ones are not
    expect(storedChainIds()).toEqual([1, 137]);
    // Nothing is handed back to switch the active network with
    expect(result).toBeUndefined();
  });

  it("syncs only the remembered chains afterwards and prunes the leftovers", async () => {
    seed(1, "0"); // active on the previous run, empty
    seed(137, "5000");
    balances.set(137, 5000n);

    await syncNetworks(nextAccount(), 137);

    expect(probedChainIds()).toEqual([137]); // whitelist is not walked again
    expect(storedChainIds()).toEqual([137]);
  });

  it("drops a chain once its balance is confirmed zero", async () => {
    seed(137, "5000");
    balances.set(137, 0n);

    await syncNetworks(nextAccount(), 1);

    expect(storedChainIds()).toEqual([1]);
  });

  it("keeps a chain when the balance request fails", async () => {
    seed(137, "5000");
    balances.set(137, null);

    await syncNetworks(nextAccount(), 1);

    expect(storedChainIds()).toEqual([1, 137]);
  });

  it("keeps a chain whose value sits in tokens rather than native coin", async () => {
    seed(137, "0", "1200");
    balances.set(137, 0n);

    await syncNetworks(nextAccount(), 1);

    expect(storedChainIds()).toEqual([1, 137]);
  });

  it("remembers a hand-picked chain that turns out to be funded", async () => {
    seed(1, "1000");
    balances.set(1, 1000n);
    balances.set(42220, 7n * ONE); // celo, outside the whitelist

    await syncNetworks(nextAccount(), 42220); // user opens celo by hand
    expect(storedChainIds()).toEqual([1, 42220]);

    probed = [];
    await syncNetworks(nextAccount(), 1); // and switches away from it
    expect(probedChainIds()).toEqual([1, 42220]); // celo stays in the set
    expect(storedChainIds()).toEqual([1, 42220]);
  });

  it("forgets a hand-picked chain that turns out to be empty", async () => {
    seed(1, "1000");
    balances.set(1, 1000n);

    await syncNetworks(nextAccount(), 42220);
    expect(storedChainIds()).toEqual([1, 42220]); // kept while active

    probed = [];
    await syncNetworks(nextAccount(), 1);
    expect(probedChainIds()).toEqual([1]);
    expect(storedChainIds()).toEqual([1]);
  });

  it("does not spend the one whitelist probe when nothing is reachable", async () => {
    for (const chainId of INITIAL_SYNC_CHAIN_IDS) balances.set(chainId, null);

    await syncNetworks(nextAccount(), 1);

    // Nothing stored, so the next run is still a first sync
    expect(db).toHaveLength(0);
  });
});
