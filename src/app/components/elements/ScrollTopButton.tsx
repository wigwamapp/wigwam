import { FC, MutableRefObject, useEffect, useState } from "react";
import classNames from "clsx";

import { IS_FIREFOX } from "app/defaults";
import { ReactComponent as ChevronDownIcon } from "app/icons/chevron-down.svg";

type ScrollTopButtonProps = {
  scrollAreaRef: MutableRefObject<HTMLDivElement | null>;
};

export const ScrollTopButton: FC<ScrollTopButtonProps> = ({
  scrollAreaRef,
}) => {
  const [isScrollTopShown, setIsScrollTopShown] = useState(false);

  useEffect(() => {
    const scrollAreaElement = scrollAreaRef.current;
    if (scrollAreaElement) {
      scrollAreaElement.addEventListener("scroll", () => {
        setIsScrollTopShown(scrollAreaElement.scrollTop >= 120);
      });

      return () => scrollAreaElement.removeEventListener("scroll", () => null);
    }
    return;
  }, [scrollAreaRef]);

  if (!isScrollTopShown || !scrollAreaRef) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={() =>
        scrollAreaRef.current?.scrollTo({
          top: 0,
          behavior: "smooth",
        })
      }
      className={classNames(
        "w-8 h-8",
        "rounded-lg",
        "bg-brand-darkblue/20",
        "backdrop-blur-[10px]",
        IS_FIREFOX && "!bg-[#0D1020]/[.95]",
        "border border-brand-main/[.05]",
        "shadow-addaccountmodal",
        "fixed bottom-14 right-3",
        "flex items-center justify-center"
      )}
    >
      <ChevronDownIcon
        className={classNames(
          "w-6 min-w-[1.5rem]",
          "h-auto",
          "-mt-0.5",
          "rotate-180"
        )}
      />
    </button>
  );
};
