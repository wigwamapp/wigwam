import FontFaceObserver from "fontfaceobserver";
import { query } from "./base";

export type Font = string | [string, number[]];

export const awaitFontsQuery = (fonts: Font[]) =>
  query({
    queryKey: ["fonts", { fonts }],
    queryFn: async () => {
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
      } catch (err) {
        if (process.env.NODE_ENV === "development") {
          console.error(err);
        }
      } finally {
        return null;
      }
    },
    retry: false,
    staleTime: Infinity,
  });
