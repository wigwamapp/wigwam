import { FC, ReactNode } from "react";
import { ethers } from "ethers";
import BigNumber from "bignumber.js";

import { useToken } from "app/hooks";
import FiatAmount from "./FiatAmount";
import PrettyAmount from "./PrettyAmount";

type BalanceProps = {
  address: string;
  copiable?: boolean;
  isMinified?: boolean;
  isNative?: boolean;
  prefix?: ReactNode;
  className?: string;
};

const Balance: FC<BalanceProps> = ({
  address,
  copiable = false,
  isMinified,
  isNative = false,
  prefix,
  className,
}) => {
  const nativeToken = useToken(address);

  const portfolioBalance = nativeToken?.portfolioUSD;

  if (portfolioBalance && !isNative) {
    return (
      <FiatAmount
        amount={nativeToken ? portfolioBalance : null}
        isMinified={
          isMinified ?? new BigNumber(portfolioBalance).isLessThan(0.01)
        }
        copiable={copiable}
        prefix={prefix}
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
      isMinified={isMinified ?? false}
      copiable={copiable}
      prefix={prefix}
      className={className}
    />
  );
};

export default Balance;
