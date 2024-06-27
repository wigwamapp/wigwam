import { changeState } from "lib/history";

import { Destination } from "./types";
import { toHash, toURL } from "./utils";

export function navigate(
  to: Destination,
  opts: {
    replace?: boolean;
    merge?: boolean | string[];
  } = {},
) {
  const url = toURL(toHash(to, opts.merge));
  changeState(url, opts.replace);
}
