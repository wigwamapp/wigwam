import { FC } from "react";
import { useAtomValue } from "jotai";
import { waitForAll } from "jotai/utils";

import { chainIdAtom, currentAccountAtom } from "app/atoms";

const PreloadUnlocked: FC = ({ children }) => {
  useAtomValue(waitForAll([currentAccountAtom, chainIdAtom]));

  return <>{children}</>;
};

export default PreloadUnlocked;
