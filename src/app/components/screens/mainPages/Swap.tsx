import { FC, useEffect } from "react";
import * as kek from "@lifi/sdk";

import ComingSoon from "app/components/elements/ComingSoon";

const Swap: FC = () => {
  useEffect(() => {
    console.info(kek);
  }, []);

  return <ComingSoon label="Swap" />;
};

export default Swap;
