import { FC, ReactNode, useCallback, useEffect, useRef, useState } from "react";
import {
  useFloating,
  shift,
  offset,
  autoPlacement,
  hide,
  arrow,
} from "@floating-ui/react-dom";
import classNames from "clsx";
import * as Portal from "@radix-ui/react-portal";

type sizeType = "large" | "small";

type NewTooltip = {
  size?: sizeType;
  content: ReactNode;
  className?: string;
};

const NewTooltip: FC<NewTooltip> = ({
  size = "large",
  content,
  className,
  children,
}) => {
  const [open, setOpen] = useState(false);
  const arrowRef = useRef(null);
  const openTimerRef = useRef(0);
  const closeTimerRef = useRef(0);

  const {
    x,
    y,
    reference,
    floating,
    strategy,
    update,
    middlewareData: { arrow: { x: arrowX, y: arrowY } = {} },
  } = useFloating({
    // placement: "left-start",
    middleware: [
      shift(),
      offset(10),
      autoPlacement({
        allowedPlacements:
          size === "large" ? ["right", "left"] : ["top", "bottom"],
      }),
      hide(),
      arrow({ element: arrowRef }),
    ],
  });

  const handleOpen = useCallback(() => {
    clearTimeout(closeTimerRef.current);
    openTimerRef.current = window.setTimeout(() => {
      setOpen(true);
      update();
    }, 200);
  }, [update]);

  const handleClose = useCallback(() => {
    clearTimeout(openTimerRef.current);
    closeTimerRef.current = window.setTimeout(() => setOpen(false), 300);
  }, [setOpen]);

  const handleCardHover = useCallback(() => {
    clearTimeout(closeTimerRef.current);
  }, []);

  useEffect(() => {
    return () => {
      clearTimeout(openTimerRef.current);
      clearTimeout(closeTimerRef.current);
    };
  }, []);

  return (
    <>
      <button
        type="button"
        ref={reference}
        onMouseEnter={handleOpen}
        onFocus={handleOpen}
        onMouseLeave={handleClose}
        onBlur={handleClose}
        className={classNames("cursor-pointer", className)}
      >
        {children}
      </button>
      <Portal.Root className="w-full pointer-events-auto">
        <div
          ref={floating}
          style={{
            position: strategy,
            top: y ?? "",
            left: x ?? "",
          }}
          className={classNames(
            open ? "block" : "hidden",
            getSizeClasses(size),
            "text-white"
          )}
          onMouseEnter={handleCardHover}
          onFocus={handleCardHover}
          onMouseLeave={handleClose}
          onBlur={handleClose}
        >
          {content}
          <div
            ref={arrowRef}
            className="absolute w-2 h-2 bg-white rotate-45"
            style={{
              top: arrowY ?? "",
              left: arrowX ?? "",
            }}
          />
        </div>
      </Portal.Root>
    </>
  );
};

export default NewTooltip;

const getSizeClasses = (size: sizeType) => {
  if (size === "large") {
    return classNames(
      "rounded-[.625rem]",
      "w-max-content max-w-[18rem]",
      "bg-brand-main/10 backdrop-blur-[60px]",
      "py-5 px-5"
    );
  }

  return classNames(
    "rounded-md",
    "bg-brand-main/20 backdrop-blur-[6px]",
    "py-1.5 px-3"
  );
};
