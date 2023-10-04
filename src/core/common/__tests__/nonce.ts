import { storage } from "lib/ext/storage";
import { getNextNonce, nonceStorageKey, saveNonce } from "../nonce";

const TEST_ADDRESS = "0xa37a58ED255089D9204125A0f3313826537759D9";

describe("Common > Nonce", () => {
  it("getNextNonce", () => {
    expect(() => getNextNonce({} as any, "5")).toThrowError(
      "Nonce not found in transaction",
    );

    expect(getNextNonce({ nonce: 0 })).toBe(0);

    expect(getNextNonce({ nonce: 3 }, "2")).toBe(3);

    expect(getNextNonce({ nonce: 3 }, "5")).toBe(6);
  });

  it("saveNonce", async () => {
    const getCurrent = () => {
      const key = nonceStorageKey(1, TEST_ADDRESS);
      return storage.fetchForce<string>(key);
    };

    await saveNonce(1, TEST_ADDRESS, "100");
    expect(await getCurrent()).toStrictEqual("100");

    await saveNonce(1, TEST_ADDRESS, "101");
    expect(await getCurrent()).toStrictEqual("101");

    await saveNonce(1, TEST_ADDRESS, "99");
    expect(await getCurrent()).toStrictEqual("101");
  });
});
