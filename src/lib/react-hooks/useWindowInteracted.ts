import { useEffect, useState } from "react";

export function useWindowInteracted(slippage = 1000 * 60) {
  const [interacted, setInteracted] = useState(true);

  useEffect(() => {
    let timer = setTimeout(() => setInteracted(false), slippage);

    const onInteract = () => {
      clearTimeout(timer);
      timer = setTimeout(() => setInteracted(false), slippage);
    };

    window.addEventListener("click", onInteract);
    window.addEventListener("scroll", onInteract);
    window.addEventListener("mousemove", onInteract);
    window.addEventListener("keypress", onInteract);

    return () => {
      window.removeEventListener("click", onInteract);
      window.removeEventListener("scroll", onInteract);
      window.removeEventListener("mousemove", onInteract);
      window.removeEventListener("keypress", onInteract);
      clearTimeout(timer);
    };
  }, [slippage]);

  return interacted;
}
