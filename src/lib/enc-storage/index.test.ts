import { getCryptoKey } from "lib/crypto-utils";

import * as Storage from "./index";

test("Storage works", async () => {
  expect(await Storage.isStored("kek")).toBeFalsy();
  await Storage.put("kek", "lal");
  expect(await Storage.isStored("kek")).toBeTruthy();
  expect(await Storage.fetch("kek")).toBe("lal");

  const cryptoKey = await getCryptoKey("123qweasd");
  await Storage.encryptAndSaveMany([["wow", "WOW"]], cryptoKey);
  expect(await Storage.fetchAndDecryptOne("wow", cryptoKey)).toBe("WOW");
});
