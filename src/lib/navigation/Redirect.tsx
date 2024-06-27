import { FC, ReactElement, useLayoutEffect } from "react";

import { Destination } from "./types";
import { navigate } from "./navigate";

type RedirectProps = {
  to?: Destination;
  merge?: boolean | string[];
  push?: boolean;
  fallback?: ReactElement;
};

const Redirect: FC<RedirectProps> = ({
  to = {},
  merge,
  push = false,
  fallback = null,
}) => {
  useLayoutEffect(
    () => navigate(to, { merge, replace: !push }),
    [to, merge, push],
  );

  return fallback;
};

export default Redirect;
