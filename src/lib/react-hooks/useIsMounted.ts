import { useRef, useEffect, useCallback } from "react";

export function useIsMounted() {
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
  }, []);

  return useCallback(() => mountedRef.current, []);
}
