import FontFaceObserver from "fontfaceobserver";

export type Font = string | [string, ...number[]];

export async function awaitFonts(fonts: Font[]) {
  try {
    const fontFaces: FontFaceObserver[] = [];
    for (const font of fonts) {
      if (Array.isArray(font)) {
        const [name, ...weights] = font;
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
