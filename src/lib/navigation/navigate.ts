import { changeState } from "lib/history";

import { Destination } from "./types";
import { toHash, toURL } from "./utils";

export function navigate(to: Destination, action?: "replace") {
  const url = toURL(toHash(to));
  changeState(url, action === "replace");
}
