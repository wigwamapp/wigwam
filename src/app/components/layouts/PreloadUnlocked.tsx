import { FC, useEffect } from "react";
import { useAtomValue } from "jotai";
import { waitForAll } from "jotai/utils";
import { useWindowFocus } from "lib/react-hooks/useWindowFocus";

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
      sync(chainId, currentAccount.address);

      t = setTimeout(syncAndDefer, 3_000);
    };

    if (windowFocused) {
      t = setTimeout(syncAndDefer);
    }

    return () => clearTimeout(t);
  }, [chainId, currentAccount.address, windowFocused]);

  return <>{children}</>;
};

export default PreloadUnlocked;
