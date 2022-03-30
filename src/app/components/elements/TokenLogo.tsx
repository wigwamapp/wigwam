import { ComponentProps, FC, useMemo } from "react";

import { getTokenLogoUrl } from "fixtures/networks";

import Avatar from "./Avatar";

const TokenLogo: FC<ComponentProps<typeof Avatar>> = ({ src, ...rest }) => {
  src = useMemo(() => getTokenLogoUrl(src), [src]);

  return <Avatar src={src} {...rest} />;
};

export default TokenLogo;
