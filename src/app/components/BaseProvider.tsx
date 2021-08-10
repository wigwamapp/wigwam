import { FC, Suspense, useEffect } from "react";
import { LocationProvider } from "woozie";
import { Provider as JotaiProvider, atom } from "jotai";
import { useAtomValue, waitForAll } from "jotai/utils";

import { FONTS } from "app/defaults";
import { fontsAtom, i18nAtom } from "app/atoms";
import ErrBond from "app/components/layouts/ErrBond";

const BaseProvider: FC = ({ children }) => (
  <>
    <SetImageBg />

    <LocationProvider>
      <ErrBond>
        <JotaiProvider>
          <Suspense fallback={null}>
            <Boot />

            {children}
          </Suspense>
        </JotaiProvider>
      </ErrBond>
    </LocationProvider>
  </>
);

export default BaseProvider;

const bootAtom = atom(() => waitForAll([fontsAtom(FONTS), i18nAtom]));

const Boot: FC = () => {
  useAtomValue(bootAtom);
  return null;
};

const SetImageBg: FC = () => {
  useEffect(() => {
    const t = setTimeout(() => {
      document.documentElement.style.backgroundImage = "url(images/bg.jpeg)";
    }, 100);
    return () => clearTimeout(t);
  }, []);

  return null;
};
