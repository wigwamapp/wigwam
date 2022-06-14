import { FC, Suspense } from "react";
import { Provider as JotaiProvider, useAtomValue } from "jotai";
import { waitForAll } from "jotai/utils";

import { FONTS } from "app/defaults";
import {
  fontsAtom,
  i18nAtom,
  currentLocaleAtom,
  currenciesRateAtom,
  selectedCurrencyAtom,
} from "app/atoms";
import { DialogProvider } from "app/hooks/dialog";
import { ContactsDialogProvider } from "app/hooks/contacts";
import ErrBond from "app/components/layouts/ErrBond";

const BaseProvider: FC = ({ children }) => (
  <>
    <ErrBond>
      <JotaiProvider>
        <Suspense fallback={null}>
          <Boot />

          <DialogProvider>
            <ContactsDialogProvider>{children}</ContactsDialogProvider>
          </DialogProvider>
        </Suspense>
      </JotaiProvider>
    </ErrBond>
  </>
);

export default BaseProvider;

const bootAtom = waitForAll([
  fontsAtom(FONTS),
  i18nAtom,
  currentLocaleAtom,
  currenciesRateAtom,
  selectedCurrencyAtom,
]);

const Boot: FC = () => {
  useAtomValue(bootAtom);

  return null;
};
