import { FC, ReactElement, useLayoutEffect } from "react";
import { changeState } from "lib/history";

import { Destination } from "./types";
import { toHash, toURL } from "./utils";

type RedirectProps = {
  to: Destination;
  merge?: boolean | string[];
  push?: boolean;
  fallback?: ReactElement;
};

const Redirect: FC<RedirectProps> = ({
  to,
  merge,
  push = false,
  fallback = null,
}) => {
  useLayoutEffect(
    () => changeState(toURL(toHash(to, merge)), !push),
    [to, merge, push]
  );

  return fallback;
};

export default Redirect;
