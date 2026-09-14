import {
  isKnownDappHost,
  parseDappHostPatterns,
  toDappHost,
} from "../knownDapps";

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

describe("parseDappHostPatterns", () => {
  const matches = (whitelist: string, host: string) =>
    parseDappHostPatterns(whitelist).some((pattern) => pattern.test(host));

  it("takes a comma separated list of urls and bare hosts", () => {
    const whitelist = " https://kek.io/some/path , kek.app ";

    expect(matches(whitelist, "kek.io")).toBe(true);
    expect(matches(whitelist, "kek.app")).toBe(true);
    expect(matches(whitelist, "other.io")).toBe(false);
  });

  it("matches a literal entry exactly, subdomains included only via `*`", () => {
    expect(matches("https://kek.io", "app.kek.io")).toBe(false);
    expect(matches("https://*.kek.io", "app.kek.io")).toBe(true);
  });

  it("covers subdomains at any depth behind a leading `*.`", () => {
    const whitelist = "https://*.kek.io";

    expect(matches(whitelist, "a.b.kek.io")).toBe(true);
    // The wildcard asks for a subdomain, the bare domain is a separate entry
    expect(matches(whitelist, "kek.io")).toBe(false);
  });

  it("matches part of a label too", () => {
    const whitelist = "app-*.kek.io";

    expect(matches(whitelist, "app-1.kek.io")).toBe(true);
    expect(matches(whitelist, "app-1.beta.kek.io")).toBe(false);
    expect(matches(whitelist, "evil.io")).toBe(false);
  });

  it("normalizes like the directory does, so a match cannot be dodged", () => {
    expect(matches("https://WWW.Kek.IO", "kek.io")).toBe(true);
  });

  it("reads the entry as text, not through the url parser", () => {
    // Chrome parses the host of `https://*.cedex.io` into `%2A.cedex.io`,
    // node and the spec keep `*.cedex.io`. Going through `new URL` here left
    // the whitelist empty in the browser while this suite, on node, passed
    expect(matches("https://*.cedex.io", "app.cedex.io")).toBe(true);
    expect(parseDappHostPatterns("https://%2A.cedex.io")).toHaveLength(0);
  });

  it("ignores whatever a url carries besides the host", () => {
    expect(matches("https://kek.io:8080/path?q=1#top", "kek.io")).toBe(true);
    expect(matches("https://user:pass@kek.io", "kek.io")).toBe(true);
  });

  it("never lets a wildcard swallow a tld or the whole internet", () => {
    expect(parseDappHostPatterns("*")).toHaveLength(0);
    expect(parseDappHostPatterns("*.*")).toHaveLength(0);
    expect(parseDappHostPatterns("kek.*")).toHaveLength(0);
    expect(parseDappHostPatterns("https://*.io")).toHaveLength(0);
  });

  it("drops junk instead of throwing, a typo must not break the build", () => {
    expect(parseDappHostPatterns(undefined)).toEqual([]);
    expect(parseDappHostPatterns("")).toEqual([]);
    expect(parseDappHostPatterns(", ,")).toEqual([]);
    expect(parseDappHostPatterns("localhost")).toEqual([]);
    expect(parseDappHostPatterns("not a host")).toEqual([]);

    // The good entries next to a bad one survive
    expect(parseDappHostPatterns("not a host, kek.io")).toHaveLength(1);
  });

  it("does not let a dot in an entry match any character", () => {
    expect(matches("kek.io", "kekxio")).toBe(false);
  });
});
