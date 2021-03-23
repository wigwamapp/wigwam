import * as Encryptor from "lib/encryptor";
import * as Storage from "./index";

test("Storage works", async () => {
  expect(await Storage.isStored("kek")).toBeFalsy();
  await Storage.put("kek", "lal");
  expect(await Storage.isStored("kek")).toBeTruthy();
  expect(await Storage.fetch("kek")).toBe("lal");

  const passwordKey = await Encryptor.generateKey("123qweasd");
  await Storage.encryptAndSaveMany([["wow", "WOW"]], passwordKey);
  expect(await Storage.fetchAndDecryptOne("wow", passwordKey)).toBe("WOW");
});
