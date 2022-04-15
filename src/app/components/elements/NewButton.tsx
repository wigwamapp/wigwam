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

    const relativeClassName = useMemo(
      () =>
        !className?.includes("absolute") &&
        !className?.includes("fixed") &&
        "relative",
      [className]
    );

    const classNamesList = classNames(
      relativeClassName,
      "overflow-hidden",
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
    viewBox="0 0 20 20"
    fill="none"
  >
    <path
      d="M18.5 10C18.5 14.6944 14.6944 18.5 10 18.5C5.30558 18.5 1.5 14.6944 1.5 10C1.5 5.30558 5.30558 1.5 10 1.5C14.6944 1.5 18.5 5.30558 18.5 10Z"
      stroke="currentColor"
      className="opacity-25"
      strokeWidth="3"
    />
    <path
      d="M11.8121 1.6954C11.9887 0.886016 11.4745 0.0746618 10.6478 0.0209989C8.98586 -0.0868834 7.31477 0.221661 5.78979 0.929505C3.80889 1.84897 2.18345 3.39163 1.16178 5.32181C0.140108 7.25198 -0.221611 9.46355 0.131881 11.6186C0.404014 13.2777 1.0885 14.8331 2.11221 16.1468C2.62142 16.8002 3.58147 16.7692 4.15148 16.168V16.168C4.72149 15.5669 4.67972 14.624 4.21354 13.9391C3.6433 13.1015 3.25827 12.1448 3.09232 11.1331C2.84488 9.62449 3.09808 8.07639 3.81325 6.72527C4.52842 5.37414 5.66623 4.29428 7.05286 3.65066C7.98283 3.219 8.99042 2.99947 10.0038 3C10.8322 3.00044 11.6354 2.50478 11.8121 1.6954V1.6954Z"
      fill="currentColor"
      className="opacity-75"
    />
  </svg>
));
