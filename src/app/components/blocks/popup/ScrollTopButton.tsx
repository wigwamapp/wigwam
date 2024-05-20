import { FC, MutableRefObject, useCallback, useEffect, useState } from "react";
import classNames from "clsx";
import { useThrottledCallback } from "use-debounce";

import { ReactComponent as ChevronDownIcon } from "app/icons/chevron-down.svg";

type ScrollTopButtonProps = {
  scrollAreaRef: MutableRefObject<HTMLDivElement | null>;
  className?: string;
};

const ScrollTopButton: FC<ScrollTopButtonProps> = ({
  scrollAreaRef,
  className,
}) => {
  const [isScrollTopShown, setIsScrollTopShown] = useState(false);

  const handleScroll = useCallback(() => {
    const scrollAreaElement = scrollAreaRef.current;

    setIsScrollTopShown(
      scrollAreaElement ? scrollAreaElement.scrollTop >= 120 : false,
    );
  }, [scrollAreaRef]);

  const handleScrollThrottled = useThrottledCallback(handleScroll, 100);

  useEffect(() => {
    const scrollAreaElement = scrollAreaRef.current;

    if (scrollAreaElement) {
      scrollAreaElement.addEventListener("scroll", handleScrollThrottled);

      return () =>
        scrollAreaElement.removeEventListener("scroll", handleScrollThrottled);
    }
    return;
  }, [scrollAreaRef, handleScrollThrottled]);

  const handleClick = useCallback(() => {
    scrollAreaRef.current?.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [scrollAreaRef]);

  if (!isScrollTopShown || !scrollAreaRef) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={classNames(
        "w-8 h-8",
        "rounded-lg",
        "bg-brand-darkgray",
        "border border-[#515561]",
        "flex items-center justify-center",
        className,
      )}
    >
      <ChevronDownIcon
        className={classNames(
          "w-6 min-w-[1.5rem]",
          "h-auto",
          "-mt-0.5",
          "rotate-180",
        )}
      />
    </button>
  );
};

export default ScrollTopButton;
