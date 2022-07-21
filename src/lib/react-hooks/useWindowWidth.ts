import { useEffect, useState } from "react";

interface Props {
  debounceMs: number;
}

export function useWindowWidth({ debounceMs }: Props): number | undefined {
  const [width, setWidth] = useState<number | undefined>(undefined);

  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth);
    };

    const debouncedHandleResize = debounce(handleResize, debounceMs);

    window.addEventListener("resize", debouncedHandleResize);

    handleResize();

    return () => window.removeEventListener("resize", debouncedHandleResize);
  }, [debounceMs]);

  return width;
}

function debounce<T extends unknown[], U>(
  callback: (...args: T) => PromiseLike<U> | U,
  wait: number
) {
  let timer: ReturnType<typeof setTimeout>;

  return (...args: T): Promise<U> => {
    clearTimeout(timer);
    return new Promise((resolve) => {
      timer = setTimeout(() => resolve(callback(...args)), wait);
    });
  };
}
