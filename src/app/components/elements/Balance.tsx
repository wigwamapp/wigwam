import { FC } from "react";
import { ethers } from "ethers";
import BigNumber from "bignumber.js";

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

  const protfolioBalane = nativeToken?.portfolioUSD;

  return (
    <PrettyAmount
      amount={
        nativeToken
          ? protfolioBalane ?? ethers.utils.formatEther(nativeToken.rawBalance)
          : null
      }
      currency={protfolioBalane ? "$" : nativeToken?.symbol}
      isMinified={
        protfolioBalane
          ? new BigNumber(protfolioBalane).isLessThan(0.01)
          : false
      }
      copiable={copiable}
      className={className}
    />
  );
};

export default Balance;
