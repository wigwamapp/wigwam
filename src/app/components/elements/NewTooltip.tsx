import { FC, ReactNode, useCallback, useEffect, useRef, useState } from "react";
import {
  useFloating,
  shift,
  offset,
  autoUpdate,
  autoPlacement,
  hide,
} from "@floating-ui/react-dom";
import classNames from "clsx";
import { createPortal } from "react-dom";

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
  const openTimerRef = useRef(0);
  const closeTimerRef = useRef(0);

  const { x, y, reference, floating, strategy, update, refs } = useFloating({
    middleware: [
      shift(),
      offset(10),
      autoPlacement({
        // 'right' and 'left' won't be chosen
        allowedPlacements:
          size === "large" ? ["right", "left"] : ["top", "bottom"],
      }),
      hide(),
    ],
  });

  useEffect(() => {
    if (!refs.reference.current || !refs.floating.current) {
      return;
    }

    // Only call this when the floating element is rendered
    return autoUpdate(refs.reference.current, refs.floating.current, update);
  }, [refs.reference, refs.floating, update]);

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
        onMouseOver={handleOpen}
        onFocus={handleOpen}
        onMouseLeave={handleClose}
        onBlur={handleClose}
        className={classNames("cursor-pointer", className)}
      >
        {children}
      </button>
      <Portal>
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
          onMouseOver={handleCardHover}
          onFocus={handleCardHover}
          onMouseLeave={handleClose}
          onBlur={handleClose}
        >
          {content}
        </div>
      </Portal>
    </>
  );
};

export default NewTooltip;

const getSizeClasses = (size: sizeType) => {
  if (size === "large") {
    return classNames(
      "rounded-[.625rem]",
      "max-w-[18rem]",
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

type PortalProps = {
  className?: string;
};

const Portal: FC<PortalProps> = ({ children }) => {
  const [container] = useState(() => {
    // This will be executed only on the initial render
    // https://reactjs.org/docs/hooks-reference.html#lazy-initial-state
    return document.createElement("div");
  });

  useEffect(() => {
    container.classList.add("relative", "z-[10000]");
    document.body.appendChild(container);
    return () => {
      document.body.removeChild(container);
    };
  }, [container]);

  return createPortal(children, container);
};
