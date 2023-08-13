import * as repo from "core/repo";

import { cleanupNetwork, getNetwork, getRpcUrl, setRpcUrl } from "../network";
import { DEFAULT_NETWORKS, INITIAL_NETWORK } from "fixtures/networks";
import { storage } from "lib/ext/storage";

beforeAll(() => repo.setupFixtures());

afterEach(() => storage.clear());

describe("Common > Network", () => {
  it("All networks exists", () => {
    expect(repo.networks.toArray()).resolves.toStrictEqual(DEFAULT_NETWORKS);
  });

  it("getNetwork", () => {
    expect(getNetwork(INITIAL_NETWORK.chainId)).resolves.toEqual({
      ...INITIAL_NETWORK,
      position: 0,
    });
  });

  it("getRpcUrl", async () => {
    expect(getRpcUrl(INITIAL_NETWORK.chainId)).resolves.toBe(
      INITIAL_NETWORK.rpcUrls[0],
    );
  });

  it("setRpcUrl", async () => {
    expect(getRpcUrl(INITIAL_NETWORK.chainId)).resolves.toBe(
      INITIAL_NETWORK.rpcUrls[0],
    );

    await setRpcUrl(INITIAL_NETWORK.chainId, INITIAL_NETWORK.rpcUrls[1]);

    expect(getRpcUrl(INITIAL_NETWORK.chainId)).resolves.toBe(
      INITIAL_NETWORK.rpcUrls[1],
    );
  });

  it("cleanupNetwork", async () => {
    const network = DEFAULT_NETWORKS[9]; // Not default

    expect(getRpcUrl(network.chainId)).resolves.toBe(network.rpcUrls[0]);

    await cleanupNetwork(network.chainId);

    expect(getRpcUrl(network.chainId)).rejects.toThrowError(
      "Network Not Found",
    );
  });
});
