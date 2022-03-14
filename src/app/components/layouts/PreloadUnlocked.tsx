import { FC, useEffect, useState } from "react";
import { useAtomValue } from "jotai";
import { waitForAll } from "jotai/utils";

import { chainIdAtom, currentAccountAtom } from "app/atoms";
import { sync } from "core/client";

const PreloadUnlocked: FC = ({ children }) => {
  const [chainId, currentAccount] = useAtomValue(
    waitForAll([chainIdAtom, currentAccountAtom])
  );

  const windowFocused = useWindowFocus();

  useEffect(() => {
    let t: any;

    const syncAndDefer = () => {
      sync(chainId, currentAccount.uuid);

      t = setTimeout(syncAndDefer, 20_000);
    };

    if (windowFocused) {
      t = setTimeout(syncAndDefer);
    }

    return () => clearTimeout(t);
  }, [chainId, currentAccount.uuid, windowFocused]);

  return <>{children}</>;
};

export default PreloadUnlocked;

function useWindowFocus() {
  const [focused, setFocused] = useState(hasFocus); // Focus for first render

  useEffect(() => {
    setFocused(hasFocus()); // Focus for additional renders

    const onFocus = () => setFocused(true);
    const onBlur = () => setFocused(false);

    window.addEventListener("focus", onFocus);
    window.addEventListener("blur", onBlur);

    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("blur", onBlur);
    };
  }, []);

  return focused;
}

function hasFocus() {
  return typeof document !== "undefined" && document.hasFocus();
}
