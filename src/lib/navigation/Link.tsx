import {
  AnchorHTMLAttributes,
  useCallback,
  useEffect,
  useRef,
  forwardRef,
  MouseEventHandler,
} from "react";
import useForceUpdate from "use-force-update";
import { dequal } from "dequal/lite";
import { useMemoCompare } from "lib/react-hooks/useMemoCompare";
import { usePrevious } from "lib/react-hooks/usePrevious";
import { changeState, listen } from "lib/history";

import { Destination } from "./types";
import { isModifiedEvent, toHash, toURL } from "./utils";

export type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  to: Destination;
  replace?: boolean;
  merge?: boolean | string[];
  disabled?: boolean;
};

const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  (
    { to, replace, merge, children, target, disabled, onClick, ...rest },
    ref,
  ) => {
    const forceUpdate = useForceUpdate();

    to = useMemoCompare(to, dequal);
    merge = useMemoCompare(merge, dequal);

    const urlRef = useRef<string | undefined>();

    const generateUrl = useCallback(
      () => toURL(toHash(to, merge)),
      [to, merge],
    );

    const prevGenerateUrl = usePrevious(generateUrl);

    if (!urlRef.current || generateUrl !== prevGenerateUrl) {
      urlRef.current = generateUrl();
    }

    useEffect(
      () =>
        merge
          ? listen(() => {
              urlRef.current = undefined;
              forceUpdate();
            })
          : undefined,
      [merge, forceUpdate],
    );

    const url = urlRef.current;
    const navigate = useCallback(
      () => changeState(url, replace),
      [url, replace],
    );

    const handleClick = useCallback<MouseEventHandler<HTMLAnchorElement>>(
      (evt) => {
        if (disabled) {
          evt.preventDefault();
          return;
        }

        try {
          if (onClick) {
            onClick(evt);
          }
        } catch (err) {
          evt.preventDefault();
          throw err;
        }

        if (
          !evt.defaultPrevented && // onClick prevented default
          evt.button === 0 && // ignore everything but left clicks
          (!target || target === "_self") && // let browser handle "target=_blank" etc.
          !isModifiedEvent(evt) // ignore clicks with modifier keys
        ) {
          evt.preventDefault();
          navigate();
        }
      },
      [onClick, target, disabled, navigate],
    );

    return (
      <a
        ref={ref}
        href={url}
        target={target}
        onClick={handleClick}
        aria-disabled={disabled || undefined}
        {...rest}
      >
        {children}
      </a>
    );
  },
);

export default Link;
