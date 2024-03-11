import {
  ForwardedRef,
  forwardRef,
  ReactNode,
  useRef,
  useMemo,
  useState,
  useEffect,
  ButtonHTMLAttributes,
} from "react";
import classNames from "clsx";
import { CSSTransition } from "react-transition-group";
import Link, { LinkProps } from "lib/navigation/Link";

import CircleSpinner from "./CircleSpinner";

export type ButtonTheme =
  | "primary"
  | "secondary"
  | "tertiary"
  | "clean"
  | "primary-reverse";

export type ButtonProps = {
  theme?: ButtonTheme;
  disabled?: boolean;
  loading?: boolean;
  plainFocus?: boolean;
  children: ReactNode;
  innerClassName?: string;
} & (ButtonHTMLAttributes<HTMLButtonElement> | LinkProps);

const loadingTransitionTimeout = 300;

const Button = forwardRef<HTMLElement, ButtonProps>(
  (
    {
      theme = "primary",
      className,
      loading: parentLoading = false,
      plainFocus,
      innerClassName,
      ...rest
    },
    ref,
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
                loading && "opacity-0 -translate-y-[calc(100%+0.75rem)]",
                innerClassName,
              )}
            >
              {children}
            </span>

            <CSSTransition
              nodeRef={spinnerTransitionRef}
              in={loading}
              timeout={loadingTransitionTimeout}
              appear
              unmountOnExit
              classNames={{
                appear: "-translate-y-1/2",
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
                  "transition duration-300",
                )}
              >
                <CircleSpinner />
              </span>
            </CSSTransition>
          </>
        ),
        [loading, children, innerClassName],
      ),
    };

    const relativeClassName = useMemo(
      () =>
        !className?.includes("absolute") &&
        !className?.includes("fixed") &&
        "relative",
      [className],
    );

    const classNamesList = classNames(
      relativeClassName,
      "overflow-hidden",
      "py-3 px-4",
      theme !== "clean" && "min-w-[10rem]",
      !(theme === "primary" || theme === "primary-reverse") &&
        "text-brand-light",
      "text-base font-bold",
      theme === "primary" && "bg-brand-redone text-brand-darkaccent bg-opacity",
      theme === "primary-reverse" &&
        "bg-brand-redone text-brand-darkaccent bg-opacity shadow-buttonaccent",
      theme === "secondary" && "bg-brand-main bg-opacity-10",
      "rounded-[.375rem]",
      "inline-flex justify-center",
      "transition",
      theme === "primary" &&
        !disabled && [
          "hover:bg-opacity-100 hover:shadow-buttonaccent",
          plainFocus && "focus:bg-opacity-100 focus:shadow-buttonaccent",
          "focus-visible:bg-opacity-100 focus-visible:shadow-buttonaccent",
        ],
      theme === "primary-reverse" &&
        !disabled && [
          "hover:bg-opacity-90 hover:shadow-none",
          plainFocus && "focus:bg-opacity-90 focus:shadow-none",
          "focus-visible:bg-opacity-90 focus-visible:shadow-none",
        ],
      (theme === "primary" || theme === "primary-reverse") &&
        !disabled &&
        "active:bg-opacity-70 active:shadow-none",
      (theme === "secondary" || theme === "tertiary") &&
        !disabled && [
          "hover:bg-brand-main hover:bg-opacity-[.15] hover:shadow-buttonsecondary",
          plainFocus &&
            "focus:bg-brand-main focus:bg-opacity-[.15] focus:shadow-buttonsecondary",
          "focus-visible:bg-brand-main focus-visible:bg-opacity-[.15] focus-visible:shadow-buttonsecondary",
          "active:bg-brand-main active:text-brand-light/60 active:bg-opacity-10 active:shadow-none",
        ],
      theme === "clean" && [
        "font-medium",
        !disabled && "hover:opacity-70 focus-visible:opacity-70",
      ],
      disabled && "opacity-40 cursor-default",
      loading && "pointer-events-none",
      "select-none",
      className,
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
        type={
          (rest as ButtonHTMLAttributes<HTMLButtonElement>).type ?? "button"
        }
      />
    );
  },
);

export default Button;
