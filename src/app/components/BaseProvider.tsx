import { FC, Suspense, useEffect } from "react";
import { LocationProvider } from "woozie";
import { useResource } from "lib/resax";

import { FONTS } from "app/defaults";
import { fontsRes, i18nRes } from "app/resources";
import ErrBond from "app/components/layouts/ErrBond";

const BaseProvider: FC = ({ children }) => (
  <>
    <SetImageBg />

    <LocationProvider>
      <ErrBond>
        <Suspense fallback={null}>
          <BootResources />

          {children}
        </Suspense>
      </ErrBond>
    </LocationProvider>
  </>
);

export default BaseProvider;

const BootResources: FC = () => {
  useResource(fontsRes(FONTS), i18nRes);

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
