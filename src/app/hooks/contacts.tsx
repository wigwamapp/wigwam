import { useCallback, useEffect, useMemo, useRef } from "react";
import useForceUpdate from "use-force-update";
import { useLazyAtomValue } from "lib/atom-utils";
import { usePrevious } from "lib/react-hooks/usePrevious";

import { getContactsAtom } from "app/atoms";

export type UseContactsOptions = {
  search?: string;
  limit?: number;
  onReset?: () => void;
};

export function useContacts({
  search,
  limit = 40,
  onReset,
}: UseContactsOptions = {}) {
  const forceUpdate = useForceUpdate();

  const baseParams = useMemo(
    () => ({
      search,
    }),
    [search]
  );
  const prevBaseParams = usePrevious(baseParams);

  const offsetRef = useRef(0);

  if (prevBaseParams && baseParams !== prevBaseParams) {
    offsetRef.current = 0;
  }

  useEffect(() => {
    if (prevBaseParams && baseParams !== prevBaseParams) {
      onReset?.();
    }
  }, [prevBaseParams, baseParams, onReset]);

  const offset = offsetRef.current;
  const queryParams = useMemo(
    () => ({
      ...baseParams,
      limit: offset + limit,
    }),
    [baseParams, offset, limit]
  );

  const contactsAtom = getContactsAtom(queryParams);
  const prevQueryParamsRef = useRef<typeof queryParams>();

  useEffect(() => {
    // Cleanup atoms cache
    if (prevQueryParamsRef.current) {
      getContactsAtom.remove(prevQueryParamsRef.current);
    }

    prevQueryParamsRef.current = queryParams;
  }, [queryParams]);

  const contactsV = useLazyAtomValue(contactsAtom, "off");

  const pureContacts = useMemo(() => {
    if (contactsV && contactsV.length > 0) {
      return contactsV;
    }

    if (contactsV?.length === 0) {
      return [];
    }

    return undefined;
  }, [contactsV]);

  const prevContacts = usePrevious(pureContacts, "when-not-undefined");
  const contacts = pureContacts ?? prevContacts ?? [];

  const hasMore = offsetRef.current <= contacts.length;

  const loadMore = useCallback(() => {
    if (!hasMore) return;

    offsetRef.current += limit;
    forceUpdate();
  }, [forceUpdate, hasMore, limit]);

  return {
    contacts,
    hasMore,
    loadMore,
  };
}
