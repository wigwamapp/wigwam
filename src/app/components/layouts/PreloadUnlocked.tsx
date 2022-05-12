import { FC } from "react";
import { useAtomValue } from "jotai";
import { waitForAll } from "jotai/utils";

import { chainIdAtom, currentAccountAtom } from "app/atoms";
import { useSync } from "app/hooks";

const PreloadUnlocked: FC = ({ children }) => {
  const [chainId, currentAccount] = useAtomValue(
    waitForAll([chainIdAtom, currentAccountAtom])
  );

  useSync(chainId, currentAccount.address);

  return <>{children}</>;
};

export default PreloadUnlocked;
