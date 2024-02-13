import { FC, memo } from "react";
import classNames from "clsx";
import { ethers } from "ethers";

import HashPreview from "./HashPreview";
import WalletAvatar from "./WalletAvatar";

type AssetBalance = {
  symbol: string;
  name: string;
  balance: bigint;
};

type AccountPreviewProps = {
  address: string;
  baseAsset?: AssetBalance;
  quoteAsset?: AssetBalance;
};

export const AccountPreview = memo<AccountPreviewProps>(
  ({ address, baseAsset, quoteAsset }) => (
    <div className={classNames("inline-flex items-stretch")}>
      <WalletAvatar seed={address} className="h-16 w-16 mr-4" />

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
  ),
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
    <span className="font-medium mr-1">{ethers.formatEther(balance)}</span>
    <span>{symbol}</span>
  </div>
);
