import axios from "axios";
import memoize from "mem";
import { storage } from "lib/ext/storage";

import { KNOWN_DAPPS } from "core/types";
import { KnownDapps, toDappHost } from "core/common/knownDapps";

/**
 * DefiLlama's protocol directory, kept in storage for the approval screens to
 * tell an established dapp from one nobody lists.
 *
 * The response is megabytes of TVL data for a few thousand hosts, so it is
 * fetched at most once a day and only the hosts are kept — the whole set fits
 * in ~60 KB.
 */

const PROTOCOLS_URL = "https://api.llama.fi/protocols";
const CACHE_TTL = 24 * 60 * 60_000; // 1 day

/** A truncated or gutted response must not replace a good list */
const MIN_PLAUSIBLE_HOSTS = 500;

export const syncKnownDapps = memoize(
  async () => {
    const stored = await storage
      .fetchForce<KnownDapps>(KNOWN_DAPPS)
      .catch(() => null);

    if (stored?.fetchedAt && Date.now() - stored.fetchedAt < CACHE_TTL) return;

    try {
      const { data } = await axios.get<DlProtocol[]>(PROTOCOLS_URL, {
        timeout: 60_000,
      });

      if (!Array.isArray(data)) return;

      const hosts = new Set<string>();

      for (const protocol of data) {
        const host = protocol?.url && toDappHost(protocol.url);
        if (host) hosts.add(host);
      }

      if (hosts.size < MIN_PLAUSIBLE_HOSTS) return;

      await storage.put<KnownDapps>(KNOWN_DAPPS, {
        hosts: Array.from(hosts).sort(),
        fetchedAt: Date.now(),
      });
    } catch (err) {
      console.warn("Failed to refresh the known dapps directory", err);
    }
  },
  // Collapses the calls fired by every page that connects at once
  { maxAge: 60_000 },
);

type DlProtocol = {
  url?: string | null;
};
