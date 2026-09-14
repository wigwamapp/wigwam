/**
 * The DefiLlama protocol directory, boiled down to the hosts it lists.
 *
 * A connection to a host nobody in the directory claims is not proof of
 * anything — the directory only covers DeFi protocols with tracked TVL, and it
 * lists whichever domain the protocol handed in. It is a weak positive signal,
 * never a verdict: the phishing blocklist is what names a site malicious.
 */
export type KnownDapps = {
  /** Hostnames, lowercase and without a `www.` prefix */
  hosts: string[];
  fetchedAt: number;
};

/**
 * Hostname of a url, in the shape the directory is stored in. Returns null for
 * anything that is not a parseable host, so callers cannot match on junk.
 */
export function toDappHost(url: string): string | null {
  try {
    const { hostname } = new URL(url);
    const host = hostname.toLowerCase().replace(/^www\./, "");

    return host.includes(".") ? host : null;
  } catch {
    return null;
  }
}

/**
 * Whether the host is listed, or sits under a listed domain — `stake.lido.fi`
 * counts as Lido, since only Lido can put anything there.
 *
 * Walking up the labels never invents a match: `evil.co.uk` climbs to `co.uk`,
 * which no protocol can be listed under, so it stays unknown.
 */
export function isKnownDappHost(host: string, hosts: Set<string>): boolean {
  const labels = host.split(".");

  for (let i = 0; i + 2 <= labels.length; i++) {
    if (hosts.has(labels.slice(i).join("."))) return true;
  }

  return false;
}

/**
 * Our own additions to the directory, baked in at build time from
 * `WIGWAM_KNOWN_DAPPS_WHITELIST`.
 *
 * A comma separated list of urls or bare hosts, where `*` stands for a whole
 * label or part of one:
 *
 *     https://*.kek.io, kek.io, app-*.example.org
 *
 * Unlike a directory entry, a literal host matches only itself — `kek.io` does
 * not vouch for `app.kek.io`, list `*.kek.io` next to it for that. A leading
 * `*.` covers subdomains at any depth. The last label has to be literal, so no
 * entry can hand a whole tld the known-dapp badge.
 */
const WHITELISTED_DAPP_PATTERNS = parseDappHostPatterns(
  process.env.WIGWAM_KNOWN_DAPPS_WHITELIST,
);

/** Whether the host is one we vouch for ourselves. See the whitelist above. */
export function isWhitelistedDappHost(host: string): boolean {
  return WHITELISTED_DAPP_PATTERNS.some((pattern) => pattern.test(host));
}

/**
 * The whitelist env, as matchers for hosts in `toDappHost` shape. Entries that
 * are not a host pattern are dropped rather than thrown on: a typo in the
 * build env must not take the extension down, and dropping only ever narrows
 * what counts as known.
 */
export function parseDappHostPatterns(raw?: string): RegExp[] {
  if (!raw) return [];

  const patterns: RegExp[] = [];

  for (const entry of raw.split(",")) {
    const pattern = toDappHostPattern(entry);
    if (pattern) patterns.push(pattern);
  }

  return patterns;
}

/**
 * A single whitelist entry, `https://*.kek.io` or `*.kek.io` alike.
 *
 * The host is cut out by hand, not by `new URL`: `*` is no legal host
 * character, and every engine mauls it its own way — Chrome percent-encodes it
 * into `%2A`, node and the spec leave it be. Running a glob through a url
 * parser left the whitelist empty in the browser while jest, on node, stayed
 * green. An entry is a pattern, so it is read as plain text.
 */
function toDappHostPattern(entry: string): RegExp | null {
  const host = entry
    .trim()
    .toLowerCase()
    .replace(/^[a-z][a-z\d+.-]*:\/\//, "") // scheme
    .replace(/[/?#].*$/, "") // path, query, fragment
    .replace(/^[^@]*@/, "") // credentials
    .replace(/:\d*$/, "") // port
    .replace(/^www\./, "")
    .replace(/\.$/, "");

  if (!host) return null;

  const labels = host.split(".");

  // A single label is either junk or `localhost`, and a wildcard tld would
  // whitelist half the internet
  if (labels.length < 2) return null;
  if (!labels.every((label) => /^[a-z\d*_-]+$/.test(label))) return null;
  if (!/^[a-z\d-]+$/.test(labels[labels.length - 1])) return null;

  // A leading `*.` is the one wildcard that spans labels: `*.kek.io` is meant
  // to cover `a.b.kek.io` too, but still requires a subdomain to be there
  const deep = labels[0] === "*";
  const rest = deep ? labels.slice(1) : labels;
  if (rest.length < 2) return null;

  const source = rest.map(labelSource).join("\\.");

  return new RegExp(`^${deep ? "(?:[^.]+\\.)+" : ""}${source}$`);
}

/** One label, with `*` as "one or more characters that are not a dot" */
function labelSource(label: string): string {
  return label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\\\*/g, "[^.]+");
}
