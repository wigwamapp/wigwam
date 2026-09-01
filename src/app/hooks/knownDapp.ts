import { useMemo } from "react";
import { useLazyAtomValue } from "lib/atom-utils";

import { isKnownDappHost, toDappHost } from "core/common/knownDapps";

import { knownDappsAtom } from "app/atoms";

/**
 * Whether the site is listed in the DefiLlama protocol directory.
 *
 * `null` while there is nothing to check against — a directory that has not
 * arrived yet, or a url with no host. Callers must not warn on `null`: absence
 * of data is not evidence against the site.
 */
export function useIsKnownDapp(url: string): boolean | null {
  const knownDapps = useLazyAtomValue(knownDappsAtom, "off");

  return useMemo(() => {
    const hosts = knownDapps?.hosts;
    if (!hosts?.length) return null;

    const host = toDappHost(url);
    if (!host) return null;

    return isKnownDappHost(host, new Set(hosts));
  }, [knownDapps, url]);
}
