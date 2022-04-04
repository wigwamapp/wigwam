import { ComponentProps, FC, useMemo } from "react";

import { getTokenLogoUrl } from "fixtures/networks";
import { Asset } from "core/types";

import Avatar from "./Avatar";
import AutoIcon from "./AutoIcon";

type AssetLogoProps = Omit<ComponentProps<typeof Avatar>, "src"> & {
  asset: Asset;
};

const AssetLogo: FC<AssetLogoProps> = ({ asset, ...rest }) => {
  const src = useMemo(() => getTokenLogoUrl(asset.logoUrl), [asset.logoUrl]);

  return src ? (
    <Avatar src={src} {...rest} />
  ) : (
    <AutoIcon
      seed={asset.tokenSlug}
      source="boring"
      variant="ring"
      initialsSource={asset.symbol[0]}
      initialsScale={0.35}
      initialsPlaceholder
      autoColors
      {...rest}
    />
  );
};

export default AssetLogo;
