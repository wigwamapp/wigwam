import { FC, memo } from "react";
import classNames from "clsx";
import { ethers } from "ethers";

import AutoIcon from "./AutoIcon";
import HashPreview from "./HashPreview";

type AssetBalance = {
  symbol: string;
  name: string;
  balance: ethers.BigNumber;
};

type AccountPreviewProps = {
  address: string;
  baseAsset?: AssetBalance;
  quoteAsset?: AssetBalance;
};

export const AccountPreview = memo<AccountPreviewProps>(
  ({ address, baseAsset, quoteAsset }) => (
    <div className={classNames("inline-flex items-stretch")}>
      <AutoIcon
        seed={address}
        source="dicebear"
        type="avataaars"
        className="h-16 w-16 mr-4"
      />

      <div className="p-1 flex flex-col">
        <span className="text-lg font-semibold">
          <HashPreview hash={address} />
        </span>

        <div className="mt-1 flex-1 flex-col justify-around">
          {baseAsset && <AssetBalancePreivew asset={baseAsset} />}
          {quoteAsset && <AssetBalancePreivew asset={quoteAsset} />}
        </div>
      </div>
    </div>
  )
);

export default AccountPreview;

type AssetBalancePreivewProps = {
  asset: AssetBalance;
  className?: string;
};

const AssetBalancePreivew: FC<AssetBalancePreivewProps> = ({
  asset: { balance, symbol },
  className,
}) => (
  <div className={classNames("inline-flex text-base", className)}>
    <span className="font-medium mr-1">
      {ethers.utils.formatEther(balance)}
    </span>
    <span>{symbol}</span>
  </div>
);
