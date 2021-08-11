import { FC, useEffect } from "react";
import { changeState } from "lib/history";

import { Destination } from "./types";
import { toHash, toURL } from "./utils";

type RedirectProps = {
  to: Destination;
  push?: boolean;
  fallback?: React.ReactElement;
};

const Redirect: FC<RedirectProps> = ({ to, push = false, fallback = null }) => {
  useEffect(() => changeState(toURL(toHash(to)), !push), [to, push]);

  return fallback;
};

export default Redirect;
