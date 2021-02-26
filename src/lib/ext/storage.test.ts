import * as Storage from "./storage";

test("Storage rendered", async () => {
  await Storage.putOne("kek", "lal");
  expect(await Storage.fetchOne("kek")).toBe("lal");
});
