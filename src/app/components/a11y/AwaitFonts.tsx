import React, { useCallback } from "react";
import { useQuery } from "react-query";
import FontFaceObserver from "fontfaceobserver";

type Font = string | [string, number[]];

type AwaitFontsProps = {
  fonts: Font[];
};

const AwaitFonts: React.FC<AwaitFontsProps> = ({ fonts }) => {
  const awaitFonts = useCallback(async () => {
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
      if (import.meta.env.SNOWPACK_PUBLIC_DEBUG === "true") {
        console.error(err);
      }
    } finally {
      return null;
    }
  }, [fonts]);

  useQuery(["fonts", { fonts }], awaitFonts, {
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });

  return null;
};

export default AwaitFonts;
