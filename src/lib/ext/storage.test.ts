import * as Encryptor from "lib/encryptor";
import * as Storage from "./storage";

test("Storage works", async () => {
  expect(await Storage.isStored("kek")).toBeFalsy();
  await Storage.putOne("kek", "lal");
  expect(await Storage.isStored("kek")).toBeTruthy();
  expect(await Storage.fetchOne("kek")).toBe("lal");

  const passwordKey = await Encryptor.generateKey("123qweasd");
  await Storage.encryptAndSaveMany([["wow", "WOW"]], passwordKey);
  expect(await Storage.fetchAndDecryptOne("wow", passwordKey)).toBe("WOW");
});
