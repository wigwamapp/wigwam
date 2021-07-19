import { FC, useMemo } from "react";

import { useQueriesSuspense, awaitFontsQuery, Font } from "app/queries";

type AwaitFontsProps = {
  fonts: Font[];
};

const AwaitFonts: FC<AwaitFontsProps> = ({ fonts }) => {
  const query = useMemo(() => awaitFontsQuery(fonts), [fonts]);
  useQueriesSuspense([query]);
  return null;
};

export default AwaitFonts;
