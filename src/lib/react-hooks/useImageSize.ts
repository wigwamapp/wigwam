import { RefObject, useState, useEffect } from "react";

export function useImageSize(ref: RefObject<HTMLImageElement>) {
  const [imgSize, setImgSize] = useState<[number, number]>();

  useEffect(() => {
    const img = ref.current;
    let t: ReturnType<typeof setTimeout>;

    const checkAndDefer = () => {
      if (img?.naturalWidth) {
        setImgSize([img.naturalWidth, img.naturalHeight]);
      } else {
        t = setTimeout(checkAndDefer, 10);
      }
    };

    checkAndDefer();

    return () => clearTimeout(t);
  }, [ref, setImgSize]);

  return imgSize;
}
