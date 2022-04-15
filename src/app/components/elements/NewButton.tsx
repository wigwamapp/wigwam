import {
  HTMLAttributes,
  ForwardedRef,
  forwardRef,
  ReactNode,
  memo,
  useRef,
  useMemo,
  useState,
  useEffect,
} from "react";
import classNames from "clsx";
import { CSSTransition } from "react-transition-group";
import Link, { LinkProps } from "lib/navigation/Link";

type NewButtonProps = {
  theme?: "primary" | "secondary" | "tertiary" | "clean";
  disabled?: boolean;
  loading?: boolean;
  children: ReactNode;
} & (HTMLAttributes<HTMLButtonElement> | LinkProps);

const loadingTransitionTimeout = 300;

const NewButton = forwardRef<HTMLElement, NewButtonProps>(
  (
    { theme = "primary", className, loading: parentLoading = false, ...rest },
    ref
  ) => {
    const { disabled = false, children } = rest;

    const [loading, setLoading] = useState(parentLoading);
    const loadingStartedAtRef = useRef<number>();
    const spinnerTransitionRef = useRef(null);

    useEffect(() => {
      if (parentLoading) {
        loadingStartedAtRef.current = Date.now();
        setLoading(true);
        return;
      }

      const startedAt = loadingStartedAtRef.current;
      if (startedAt) {
        const delay = startedAt + loadingTransitionTimeout - Date.now();
        if (delay > 0) {
          const t = setTimeout(() => setLoading(false), delay);
          return () => clearTimeout(t);
        }

        setLoading(false);
      }

      return;
    }, [parentLoading, setLoading]);

    rest = {
      ...rest,
      disabled: disabled ?? loading,
      children: useMemo(
        () => (
          <>
            <span
              className={classNames(
                "inline-flex items-center",
                "transition transform duration-300",
                loading && "opacity-0 -translate-y-[calc(100%+0.75rem)]"
              )}
            >
              {children}
            </span>

            <CSSTransition
              nodeRef={spinnerTransitionRef}
              in={loading}
              timeout={loadingTransitionTimeout}
              unmountOnExit
              classNames={{
                enter: "opacity-0 translate-y-[150%]",
                enterActive: "!opacity-100 !-translate-y-1/2",
                enterDone: "opacity-100 -translate-y-1/2",
                exit: "opacity-100 -translate-y-1/2",
                exitActive: "!opacity-0 !translate-y-[150%]",
              }}
            >
              <span
                ref={spinnerTransitionRef}
                className={classNames(
                  "absolute inline-flex",
                  "top-1/2 left-1/2",
                  "-translate-x-1/2",
                  "transition duration-300"
                )}
              >
                <Spinner />
              </span>
            </CSSTransition>
          </>
        ),
        [loading, children]
      ),
    };

    const classNamesList = classNames(
      "relative overflow-hidden",
      "py-3 px-4",
      theme !== "clean" && "min-w-[10rem]",
      "text-brand-light text-base font-bold",
      theme === "primary" && "bg-buttonaccent bg-opacity-90",
      theme === "secondary" && "bg-brand-main bg-opacity-10",
      "rounded-[.375rem]",
      "inline-flex justify-center",
      "transition",
      theme === "primary" &&
        !disabled && [
          "hover:bg-opacity-100 hover:shadow-buttonaccent",
          "focus-visible:bg-opacity-100 focus-visible:shadow-buttonaccent",
          "active:bg-opacity-70 active:shadow-none",
        ],
      (theme === "secondary" || theme === "tertiary") &&
        !disabled && [
          "hover:bg-brand-darklight hover:bg-opacity-100 hover:shadow-buttonsecondary",
          "focus-visible:bg-brand-darklight focus-visible:bg-opacity-100 focus-visible:shadow-buttonsecondary",
          "active:bg-brand-main active:text-brand-light/60 active:bg-opacity-10 active:shadow-none",
        ],
      theme === "clean" &&
        "font-medium hover:opacity-70 focus-visible:opacity-70",
      disabled && "opacity-40 cursor-not-allowed",
      loading && "pointer-events-none",
      "select-none",
      className
    );

    if ("href" in rest) {
      return (
        <a
          ref={ref as ForwardedRef<HTMLAnchorElement>}
          target="_blank"
          rel="nofollow noreferrer"
          className={classNamesList}
          {...rest}
        />
      );
    }

    if ("to" in rest) {
      return (
        <Link
          ref={ref as ForwardedRef<HTMLAnchorElement>}
          className={classNamesList}
          {...rest}
        />
      );
    }

    return (
      <button
        ref={ref as ForwardedRef<HTMLButtonElement>}
        className={classNamesList}
        {...rest}
      />
    );
  }
);

export default NewButton;

const Spinner = memo<{ className?: string }>(({ className }) => (
  <svg
    className={classNames("animate-spin h-5 w-5 text-white", className)}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
));
