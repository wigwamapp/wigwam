import { FC, Suspense } from "react";
import { Provider as JotaiProvider, useAtomValue } from "jotai";
import { waitForAll } from "jotai/utils";

import { FONTS } from "app/defaults";
import { fontsAtom, i18nAtom, currentLocaleAtom } from "app/atoms";
import WarningProvider from "app/hooks/warning";
import ErrBond from "app/components/layouts/ErrBond";

const BaseProvider: FC = ({ children }) => (
  <>
    <ErrBond>
      <WarningProvider>
        <JotaiProvider>
          <Suspense fallback={null}>
            <Boot />

            {children}
          </Suspense>
        </JotaiProvider>
      </WarningProvider>
    </ErrBond>
  </>
);

export default BaseProvider;

const bootAtom = waitForAll([fontsAtom(FONTS), i18nAtom, currentLocaleAtom]);

const Boot: FC = () => {
  useAtomValue(bootAtom);

  return null;
};
