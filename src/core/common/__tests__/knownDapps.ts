import { isKnownDappHost, toDappHost } from "../knownDapps";

describe("toDappHost", () => {
  it("keeps the bare hostname", () => {
    expect(toDappHost("https://app.uniswap.org/swap?a=1")).toBe(
      "app.uniswap.org",
    );
  });

  it("drops the www prefix the directory is inconsistent about", () => {
    expect(toDappHost("https://www.ether.fi")).toBe("ether.fi");
  });

  it("lowercases, so a mixed-case url cannot dodge a match", () => {
    expect(toDappHost("https://App.Aave.COM")).toBe("app.aave.com");
  });

  it("refuses anything without a host to match on", () => {
    expect(toDappHost("not a url")).toBeNull();
    expect(toDappHost("http://localhost:3000")).toBeNull();
    expect(toDappHost("")).toBeNull();
  });
});

describe("isKnownDappHost", () => {
  const hosts = new Set([
    "app.uniswap.org",
    "lido.fi",
    "safe.global",
    "someprotocol.co.uk",
  ]);

  it("matches a listed host", () => {
    expect(isKnownDappHost("app.uniswap.org", hosts)).toBe(true);
  });

  it("matches a subdomain of a listed host, which only its owner controls", () => {
    expect(isKnownDappHost("stake.lido.fi", hosts)).toBe(true);
    expect(isKnownDappHost("app.safe.global", hosts)).toBe(true);
  });

  it("does not match a parent of a listed host", () => {
    // Only `app.uniswap.org` is listed, the bare domain is a different site
    expect(isKnownDappHost("uniswap.org", hosts)).toBe(false);
  });

  it("does not match an unlisted host", () => {
    expect(isKnownDappHost("uniswap-airdrop.xyz", hosts)).toBe(false);
    expect(isKnownDappHost("lido.fi.evil.com", hosts)).toBe(false);
  });

  it("never lets a public suffix vouch for a stranger", () => {
    // Climbing labels reaches `co.uk`, which is not and cannot be listed
    expect(isKnownDappHost("phishing.co.uk", hosts)).toBe(false);
    expect(isKnownDappHost("someprotocol.co.uk", hosts)).toBe(true);
  });
});
