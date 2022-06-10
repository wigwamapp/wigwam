import { useState, useEffect, useCallback } from "react";

export function useOnline() {
  const [status, setStatus] = useState(isOnline);

  const setOnline = useCallback(() => setStatus(true), [setStatus]);
  const setOffline = useCallback(() => setStatus(false), [setStatus]);

  useEffect(() => {
    window.addEventListener("online", setOnline);
    window.addEventListener("offline", setOffline);

    return () => {
      window.removeEventListener("online", setOnline);
      window.removeEventListener("offline", setOffline);
    };
  }, [setOnline, setOffline]);

  return status;
}

function isOnline() {
  return typeof navigator !== "undefined" &&
    typeof navigator.onLine === "boolean"
    ? navigator.onLine
    : true;
}
