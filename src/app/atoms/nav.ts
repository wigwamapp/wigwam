import { atomWithURLHash } from "lib/atom-utils";

import { Page } from "app/defaults";

export const pageAtom = atomWithURLHash("page", Page.Default);
