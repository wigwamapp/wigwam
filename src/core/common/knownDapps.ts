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
