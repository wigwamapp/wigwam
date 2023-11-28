import { ComponentProps, FC, useMemo } from "react";

import { getAssetLogoUrl } from "fixtures/networks";
import { Asset } from "core/types";

import Avatar from "./Avatar";
import AutoIcon from "./AutoIcon";

type AssetLogoProps = Omit<ComponentProps<typeof Avatar>, "src"> & {
  asset: Asset;
};

const AssetLogo: FC<AssetLogoProps> = ({ asset, ...rest }) => {
  const src = useMemo(() => getAssetLogoUrl(asset), [asset]);

  const fallback = (
    <AutoIcon
      seed={`${asset.chainId}_${asset.tokenSlug}`}
      source="boring"
      variant="ring"
      initialsSource={asset.symbol?.[0] ?? "NO"}
      initialsScale={0.35}
      initialsPlaceholder
      autoColors
      {...rest}
    />
  );

  return src ? (
    <Avatar src={src} fallbackNode={fallback} withBg={false} {...rest} />
  ) : (
    fallback
  );
};

export default AssetLogo;
