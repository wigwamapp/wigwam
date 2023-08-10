import { toProtectedString } from "lib/crypto-utils";
import {
  add0x,
  generatePreviewHDNodes,
  getSeedPhraseHDNode,
  toNeuterExtendedKey,
  validateAddress,
  validateDerivationPath,
  validatePrivateKey,
  validatePublicKey,
  validateSeedPhrase,
} from "../wallet";

describe("Common > Wallet", () => {
  it("validatePrivateKey", () => {
    expect(() => {
      validatePrivateKey("qwe");
    }).toThrowError("Translated<invalidPrivateKey>");

    expect(() => {
      validatePrivateKey(
        "18dd1dcd752466afa3d1fac1424333c6461c3a0f1d6702e9c45bc9254ec74e5f",
      );
    }).not.toThrow();
  });

  it("validatePublicKey", () => {
    expect(() => {
      validatePublicKey("qwe");
    }).toThrowError("Translated<invalidPublicKey>");

    expect(() => {
      validatePublicKey(
        "0x04bdfb71e2d953406c45279ac434667a6a1ea9fae608af91e7f6bfb0792011df760895a528e8b83622886039b4803b6182d708fb40a16919bddaef84493ef1d4cf",
      );
    }).not.toThrow();
  });

  it("validateAddress", () => {
    const INVALIDS = [
      "qwe",
      "0x",
      "0x00",
      "0xa37a58ed255089d9204125a0f3313826537759d943",
    ];

    for (const value of INVALIDS) {
      expect(() => {
        validateAddress(value);
      }).toThrowError("Translated<invalidAddress>");
    }

    // Valid

    expect(() => {
      validateAddress("0xa37a58ED255089D9204125A0f3313826537759D9");
    }).not.toThrow();

    expect(() => {
      validateAddress("0xa37a58ed255089d9204125a0f3313826537759d9");
    }).not.toThrow();
  });

  it("add0x", () => {
    expect(add0x("0xa37a58ed255089d9204125a0f3313826537759d9")).toEqual(
      "0xa37a58ed255089d9204125a0f3313826537759d9",
    );

    expect(add0x("a37a58ed255089d9204125a0f3313826537759d9")).toEqual(
      "0xa37a58ed255089d9204125a0f3313826537759d9",
    );
  });

  it("validateDerivationPath", () => {
    const INVALIDS = [
      "m/0'0'/0/0",
      "m/0'/s0'/0/0",
      "m/0'/0''/0/0",
      "/0'/0''/0/0",
      "0'/0''/0/0",
    ];

    for (const value of INVALIDS) {
      expect(() => {
        validateDerivationPath(value);
      }).toThrowError("Translated<invalidDerivationPath>");
    }

    expect(() => validateDerivationPath("m/0'/0'/0/0")).not.toThrow();
  });

  it("validateSeedPhrase", () => {
    const INVALIDS = [
      "elephant orange brave noodle blanket cupcake chimney kangaroo doctor syrup timber galaxy",
      "jazz enrich vivid axis depth cigar box unaware carpet throw horse regular",
      toProtectedString(
        "elephant orange brave noodle blanket cupcake chimney kangaroo doctor syrup timber galaxy",
      ),
      toProtectedString(
        "jazz enrich vivid axis depth cigar box unaware carpet throw horse regular",
      ),
      toProtectedString(
        "kiwi opinion escape sea crop potato picture fiction onion social excess vital jazz",
      ),
    ];

    for (const value of INVALIDS) {
      expect(() => {
        validateSeedPhrase({ phrase: value, lang: "en" });
      }).toThrowError("Translated<seedPhraseIsNotValid>");
    }

    expect(() =>
      validateSeedPhrase({
        phrase: toProtectedString(
          "kiwi opinion escape sea crop potato picture fiction onion social excess vital",
        ),
        lang: "en",
      }),
    ).not.toThrow();
  });

  it("getSeedPhraseHDNode", () => {
    expect(
      getSeedPhraseHDNode({
        phrase: toProtectedString(
          "kiwi opinion escape sea crop potato picture fiction onion social excess vital",
        ),
        lang: "en",
      }).extendedKey,
    ).toEqual(
      "xprv9s21ZrQH143K4Vn7iQi6Bcamj1vec9piEW3CWPQPoX42vxUVgHRNqabHGuk9aSkCGjQpdSPkvZbcGGUX29x1sjohJRUbxt9rX59DmSfmhtf",
    );
  });

  it("toNeuterExtendedKey", () => {
    expect(
      toNeuterExtendedKey(
        getSeedPhraseHDNode({
          phrase: toProtectedString(
            "kiwi opinion escape sea crop potato picture fiction onion social excess vital",
          ),
          lang: "en",
        }),
      ),
    ).toEqual(
      "xpub661MyMwAqRbcGyrapSF6YkXWH3m91cYZbixoJmp1Mrb1okoeDpjdPNum8AtP7Q3wqbyKVKzchHcYzeT5CnXsGFjoSNVbYE6K6XHhN5siavY",
    );
  });

  it("generatePreviewHDNodes", () => {
    const extendedKey = toNeuterExtendedKey(
      getSeedPhraseHDNode({
        phrase: toProtectedString(
          "kiwi opinion escape sea crop potato picture fiction onion social excess vital",
        ),
        lang: "en",
      }),
    );

    expect(
      generatePreviewHDNodes(extendedKey).map((n) => n.address),
    ).toStrictEqual([
      "0x94D96AcdeA5ff1128213A28daD25fdfbC6331450",
      "0x342C0EBD95986bfB44e424bD367f88C64214fB13",
      "0xBcA724FF9E18F48f7dD3C1289e87EF6e469FD2a0",
      "0xB9F28611417ad089db173705A75aAcB28D855d4b",
      "0xC92C0Cc17fc0A8b5972DbBD7b0d2349993E90884",
      "0x5bF128b3C323Af42579a72dB110D9bd0D3c288BF",
      "0xFc996C4EC4053200Da2A8776Ac6e13a335381027",
      "0xB3A5c7e5eC1A2e89985B158468C44f08bc21014c",
      "0x58C53973CC88ebCc0e9B544dCd63913c8a25Fe4e",
    ]);
  });
});
