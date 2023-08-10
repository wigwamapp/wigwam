import { atom } from "jotai";
import { atomFamily } from "jotai/utils";
import { dequal } from "dequal/lite";
import { initPromise } from "lib/ext/i18n";
import { awaitFonts, Font } from "lib/web-fonts";

export const i18nAtom = atom(() => initPromise);

export const fontsAtom = atomFamily(
  (fonts: Font[]) => atom(() => awaitFonts(fonts)),
  dequal,
);
