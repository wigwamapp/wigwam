import { validatePrivateKey, validatePublicKey } from "../helpers";

describe("validatePrivateKey()", () => {
  it("validate", () => {
    expect(() => {
      validatePrivateKey("qwe");
    }).toThrowError("Invalid private key");

    expect(() => {
      validatePrivateKey(
        "18dd1dcd752466afa3d1fac1424333c6461c3a0f1d6702e9c45bc9254ec74e5f"
      );
    }).not.toThrow();
  });
});

describe("validatePublicKey()", () => {
  it("validate", () => {
    expect(() => {
      validatePublicKey("qwe");
    }).toThrowError("Invalid public key");

    expect(() => {
      validatePublicKey(
        "0x04bdfb71e2d953406c45279ac434667a6a1ea9fae608af91e7f6bfb0792011df760895a528e8b83622886039b4803b6182d708fb40a16919bddaef84493ef1d4cf"
      );
    }).not.toThrow();
  });
});
