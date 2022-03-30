import { FC } from "react";
import { ethers } from "ethers";

import { useAccountNativeToken } from "app/hooks";
import PrettyAmount from "./PrettyAmount";

type BalanceProps = {
  address: string;
  copiable?: boolean;
  className?: string;
};

const Balance: FC<BalanceProps> = ({
  address,
  copiable = false,
  className,
}) => {
  const nativeToken = useAccountNativeToken(address);

  return (
    <PrettyAmount
      amount={
        nativeToken ? ethers.utils.formatEther(nativeToken.rawBalance) : null
      }
      currency={nativeToken?.symbol}
      copiable={copiable}
      className={className}
    />
  );
};

export default Balance;
