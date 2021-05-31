import { FC } from "react";
import { useQuery } from "react-query";

import { awaitI18NQuery } from "app/queries";

const AwaitI18N: FC = () => {
  useQuery(awaitI18NQuery);
  return null;
};

export default AwaitI18N;
