import {
  FC,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  useFloating,
  shift,
  offset,
  autoPlacement,
  hide,
  arrow,
  autoUpdate,
} from "@floating-ui/react-dom";
import classNames from "clsx";
import * as Portal from "@radix-ui/react-portal";
import { match } from "ts-pattern";

type SizeType = "large" | "small";

type NewTooltip = {
  size?: SizeType;
  content: ReactNode;
  className?: string;
};

const NewTooltip: FC<NewTooltip> = ({
  size = "large",
  content,
  className,
  children,
}) => {
  const [open, setOpen] = useState(true);
  const arrowRef = useRef(null);
  const openTimerRef = useRef(0);
  const closeTimerRef = useRef(0);

  const {
    refs,
    x,
    y,
    reference,
    placement,
    floating,
    strategy,
    update,
    middlewareData: { arrow: { x: arrowX, y: arrowY } = {} },
  } = useFloating({
    placement: "top",
    middleware: [
      offset(10),
      // autoPlacement({
      //   allowedPlacements:
      //     size === "large" ? ["right", "left"] : ["top", "bottom"],
      // }),
      shift(),
      arrow({ element: arrowRef }),
      hide(),
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

  useEffect(() => {
    if (!refs.reference.current || !refs.floating.current) {
      return;
    }

    return autoUpdate(refs.reference.current, refs.floating.current, update);
  }, [refs.reference, refs.floating, update]);

  const arrowInfo = useMemo(() => {
    if (!refs.floating.current) {
      return null;
    }
    const arrowDirection = getArrowDirection(placement);

    if (!arrowDirection) {
      return null;
    }

    return match(arrowDirection)
      .with("toLeft", () => ({
        y: arrowY,
        x: -getArrowDimensions(size).width,
        direction: arrowDirection,
      }))
      .with("toRight", () => ({
        y: arrowY,
        x: "100%",
        direction: arrowDirection,
      }))
      .with("toTop", () => ({
        y: -getArrowDimensions(size).height,
        x: arrowX,
        direction: arrowDirection,
      }))
      .with("toBottom", () => ({
        y: "100%",
        x: arrowX,
        direction: arrowDirection,
      }))
      .otherwise(() => null);
  }, [arrowX, arrowY, placement, refs.floating, size]);

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
          {arrowInfo && (
            <div
              ref={arrowRef}
              className={classNames(
                "absolute w-0 h-0",
                getArrowClassNames(size, arrowInfo.direction)
              )}
              style={{
                top: arrowInfo.y,
                left: arrowInfo.x,
              }}
            />
          )}
        </div>
      </Portal.Root>
    </>
  );
};

export default NewTooltip;

const getSizeClasses = (size: SizeType) =>
  match(size)
    .with("large", () =>
      classNames(
        "rounded-[.625rem]",
        "w-max-content max-w-[18rem]",
        "bg-brand-main/10 backdrop-blur-[60px]",
        "py-5 px-5"
      )
    )
    .otherwise(() =>
      classNames(
        "rounded-md",
        "bg-brand-main/20 backdrop-blur-[6px]",
        "py-1.5 px-3"
      )
    );

const getArrowDirection = (placement: string) => {
  if (placement.startsWith("left")) {
    return "toRight";
  }
  if (placement.startsWith("right")) {
    return "toLeft";
  }
  if (placement.startsWith("top")) {
    return "toBottom";
  }
  if (placement.startsWith("bottom")) {
    return "toTop";
  }
  return null;
};

const getArrowDimensions = (size: SizeType) =>
  match(size)
    .with("large", () => ({
      width: 6,
      height: 20,
    }))
    .otherwise(() => ({
      width: 3,
      height: 7,
    }));

const getArrowClassNames = (size: SizeType, direction: string) =>
  match(size)
    .with("large", () => {
      const color = classNames("border-brand-main/10 backdrop-blur-[60px]");

      return match(direction)
        .with("toTop", () =>
          classNames(
            color,
            "border-x-[10px] border-t-[6px] border-x-transparent"
          )
        )
        .with("toBottom", () =>
          classNames(
            color,
            "border-x-[10px] border-b-[6px] border-x-transparent"
          )
        )
        .with("toRight", () =>
          classNames(
            color,
            "border-y-[10px] border-l-[6px] border-y-transparent"
          )
        )
        .with("toLeft", () =>
          classNames(
            color,
            "border-y-[10px] border-r-[6px] border-y-transparent"
          )
        );
    })
    .otherwise(() =>
      classNames(
        "w-0 h-0 border-x-[7px] border-b-[3px] border-x-transparent" +
          " border-b-[#000000]"
      )
    );
