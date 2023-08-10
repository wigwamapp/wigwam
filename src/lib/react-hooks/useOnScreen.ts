import { RefObject, useState, useEffect, useMemo } from "react";

export function useOnScreen<T extends Element>(
  ref: RefObject<T>,
  rootMargin = "0px",
) {
  // State and setter for storing whether element is visible
  const [isIntersecting, setIntersecting] = useState(false);

  const observer = useMemo(
    () =>
      new IntersectionObserver(
        ([entry]) => {
          // Update our state when observer callback fires
          setIntersecting(entry.isIntersecting);
        },
        { rootMargin },
      ),
    [setIntersecting, rootMargin],
  );

  useEffect(() => {
    const target = ref.current;
    if (!target) return;

    observer.observe(target);
    return () => observer.unobserve(target);
  }, [ref, observer]);

  return isIntersecting;
}
