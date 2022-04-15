import { FC } from "react";
import { ethers } from "ethers";
import BigNumber from "bignumber.js";

import { useToken } from "app/hooks";
import USDAmount from "./USDAmount";

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
  const nativeToken = useToken(address);

  const protfolioBalane = nativeToken?.portfolioUSD;

  return (
    <USDAmount
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
