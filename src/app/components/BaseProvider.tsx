import { FC, PropsWithChildren, Suspense } from "react";
import { useAtomsAll } from "lib/atom-utils";

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

const BaseProvider: FC<PropsWithChildren> = ({ children }) => (
  <>
    <ErrBond>
      <Suspense>
        <Boot />

        <DialogProvider>
          <ContactsDialogProvider>{children}</ContactsDialogProvider>
        </DialogProvider>
      </Suspense>
    </ErrBond>
  </>
);

export default BaseProvider;

const Boot: FC = () => {
  useAtomsAll([
    fontsAtom(FONTS),
    i18nAtom,
    currentLocaleAtom,
    currenciesRateAtom,
    selectedCurrencyAtom,
  ]);

  return null;
};
