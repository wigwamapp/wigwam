import { atomWithURLHash } from "lib/navigation";

import { Page } from "app/defaults";

export const pageAtom = atomWithURLHash("page", Page.Default);
