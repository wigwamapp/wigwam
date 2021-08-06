import { atom } from "jotai";
import { atomFamily } from "jotai/utils";
import { dequal } from "dequal/lite";
import FontFaceObserver from "fontfaceobserver";
import { initPromise } from "lib/ext/i18n";

export const fontsAtomFamily = atomFamily(
  (fonts: Font[]) => atom(() => awaitFonts(fonts)),
  dequal
);

export const i18nAtom = atom(() => initPromise);

type Font = string | [string, number[]];

async function awaitFonts(fonts: Font[]) {
  try {
    const fontFaces: FontFaceObserver[] = [];
    for (const font of fonts) {
      if (Array.isArray(font)) {
        const [name, weights] = font;
        for (const weight of weights) {
          fontFaces.push(new FontFaceObserver(name, { weight }));
        }
      } else {
        fontFaces.push(new FontFaceObserver(font));
      }
    }

    await Promise.all(fontFaces.map((ff) => ff.load(undefined, 5_000)));
  } catch {}
}
