import { FC, AnchorHTMLAttributes, useMemo, useCallback } from "react";
import { changeState } from "lib/history";

import { Destination } from "./types";
import { isModifiedEvent, toHash, toURL } from "./utils";

export type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  to: Destination;
  replace?: boolean;
};

const Link: FC<LinkProps> = ({
  to,
  replace = false,
  children,
  onClick,
  target,
  ...rest
}) => {
  const url = useMemo(() => toURL(toHash(to)), [to]);

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
