import { getCryptoKey } from "lib/crypto-utils";
import { storage } from "lib/ext/storage";

import { encryptAndSaveMany, fetchAndDecryptOne } from "./index";

test("Storage works", async () => {
  expect(await storage.isStored("kek")).toBeFalsy();
  await storage.put("kek", "lal");
  expect(await storage.isStored("kek")).toBeTruthy();
  expect(await storage.fetch("kek")).toBe("lal");

  const cryptoKey = await getCryptoKey("123qweasd");
  await encryptAndSaveMany([["wow", "WOW"]], cryptoKey);
  expect(await fetchAndDecryptOne("wow", cryptoKey)).toBe("WOW");
});
