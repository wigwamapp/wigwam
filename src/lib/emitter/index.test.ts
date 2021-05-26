import { Emitter } from "./index";

describe("emitter", () => {
  let inst: Emitter;

  beforeEach(() => {
    inst = new Emitter();
  });

  describe("on()", () => {
    it("should be a function", () => {
      expect(inst).toHaveProperty("on");
      expect(typeof inst.on).toBe("function");
    });
  });
});
