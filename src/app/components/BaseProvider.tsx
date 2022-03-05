import { FC, Suspense } from "react";
import { Provider as JotaiProvider, useAtomValue } from "jotai";
import { waitForAll } from "jotai/utils";

import { FONTS } from "app/defaults";
import { fontsAtom, i18nAtom, currentLocaleAtom } from "app/atoms";
import ErrBond from "app/components/layouts/ErrBond";

const BaseProvider: FC = ({ children }) => (
  <>
    <ErrBond>
      <JotaiProvider>
        <Suspense fallback={null}>
          <Boot />

          {children}
        </Suspense>
      </JotaiProvider>
    </ErrBond>
  </>
);

export default BaseProvider;

const bootAtom = waitForAll([fontsAtom(FONTS), i18nAtom, currentLocaleAtom]);

const Boot: FC = () => {
  useAtomValue(bootAtom);

  return null;
};
