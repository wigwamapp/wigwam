import { FC, useMemo } from "react";

import { isPopup } from "lib/ext/view";

const Unlock: FC = () => {
  const popup = useMemo(() => isPopup(), []);

  return <>{popup ? "Popup unlock" : "Unlock"}</>;
};

export default Unlock;
