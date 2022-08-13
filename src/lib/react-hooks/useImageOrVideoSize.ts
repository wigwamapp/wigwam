import { RefObject, useState, useEffect } from "react";

export function useImageOrVideoSize(
  ref: RefObject<HTMLImageElement | HTMLVideoElement>
) {
  const [size, setSize] = useState<[number, number]>();

  useEffect(() => {
    const el = ref.current;
    let t: ReturnType<typeof setTimeout>;

    const checkAndDefer = () => {
      if (el) {
        if ("naturalWidth" in el && el.naturalWidth) {
          setSize([el.naturalWidth, el.naturalHeight]);
          return;
        }

        if ("videoWidth" in el && el.videoWidth) {
          setSize([el.videoWidth, el.videoHeight]);
          return;
        }
      }

      t = setTimeout(checkAndDefer, 10);
    };

    checkAndDefer();

    return () => clearTimeout(t);
  }, [ref, setSize]);

  return size;
}
