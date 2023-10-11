import { FC } from "react";
import classNames from "clsx";

import Avatar from "app/components/elements/Avatar";
import vigvamLogoUrl from "app/images/vigvam.png";

const iconsClassNames = classNames(
  "w-[4.65rem] h-[4.75rem] min-w-[4.75rem]",
  "border border-brand-main/60",
);

const DappLogos: FC<{ dappLogoUrl?: string }> = ({ dappLogoUrl }) => (
  <div className="flex items-center">
    <Avatar
      className={classNames(iconsClassNames, "z-10")}
      src={vigvamLogoUrl}
    />
    <Avatar
      className={classNames(iconsClassNames, "-ml-7")}
      src={dappLogoUrl}
      imageClassName="min-h-[calc(100%+1px)] min-w-[calc(100%+1px)]"
    />
  </div>
);

export default DappLogos;
