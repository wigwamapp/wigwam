import * as Storage from "./storage";

test("Storage rendered", async () => {
  await Storage.putOne("kek", "lal");
  expect(true).toBe(true);
});
