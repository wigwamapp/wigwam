import {
  FC,
  AnchorHTMLAttributes,
  useCallback,
  useEffect,
  useRef,
} from "react";
import useForceUpdate from "use-force-update";
import { changeState, listen } from "lib/history";

import { Destination } from "./types";
import { isModifiedEvent, toHash, toURL } from "./utils";

export type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  to: Destination;
  replace?: boolean;
  merge?: boolean;
};

const Link: FC<LinkProps> = ({
  to,
  replace,
  merge,
  children,
  onClick,
  target,
  ...rest
}) => {
  const forceUpdate = useForceUpdate();

  const urlRef = useRef<string | undefined>();
  const generateUrl = useCallback(() => toURL(toHash(to, merge)), [to, merge]);

  if (!urlRef.current) {
    urlRef.current = generateUrl();
  }

  useEffect(
    () =>
      listen(() => {
        urlRef.current = generateUrl();
        forceUpdate();
      }),
    [forceUpdate, generateUrl]
  );

  const url = urlRef.current;
  const navigate = useCallback(() => changeState(url, replace), [url, replace]);

  const handleClick = useCallback(
    (evt) => {
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
    [onClick, target, navigate]
  );

  return (
    <a href={url} target={target} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
};

export default Link;
