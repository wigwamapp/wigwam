import { onInited } from "lib/ext/i18n";

import { query } from "./base";

export const awaitI18NQuery = query({
  queryKey: "i18n",
  queryFn: () => new Promise((r) => onInited(() => r(null))),
  staleTime: Infinity,
});
