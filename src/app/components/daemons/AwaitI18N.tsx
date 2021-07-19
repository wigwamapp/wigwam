import { FC } from "react";

import { useQueriesSuspense, awaitI18NQuery } from "app/queries";

const AwaitI18N: FC = () => {
  useQueriesSuspense([awaitI18NQuery]);
  return null;
};

export default AwaitI18N;
