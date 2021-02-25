// import chrome from "sinon-chrome";
import { expect } from "chai";
import * as Storage from "./storage";

describe("ext/storage", () => {
  // before(function () {
  //   (global as any).chrome = chrome;
  // });

  it("renders fine", async () => {
    const kekStored = await Storage.isStored("kek");
    expect(kekStored === false);
  });
});
