import { FC } from "react";
import { ethers } from "ethers";
import BigNumber from "bignumber.js";

import { useToken } from "app/hooks";
import FiatAmount from "./FiatAmount";
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
  const nativeToken = useToken(address);

  const portfolioBalance = nativeToken?.portfolioUSD;

  if (portfolioBalance) {
    return (
      <FiatAmount
        amount={nativeToken ? portfolioBalance : null}
        isMinified={new BigNumber(portfolioBalance).isLessThan(0.01)}
        copiable={copiable}
        className={className}
      />
    );
  }

  return (
    <PrettyAmount
      amount={
        nativeToken ? ethers.utils.formatEther(nativeToken.rawBalance) : null
      }
      currency={nativeToken?.symbol}
      isMinified={false}
      copiable={copiable}
      className={className}
    />
  );
};

export default Balance;
