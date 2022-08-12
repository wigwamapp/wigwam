import { FC, ReactNode } from "react";
import BigNumber from "bignumber.js";

import { AccountAsset } from "core/types";

import { useToken } from "app/hooks";

import FiatAmount from "./FiatAmount";
import PrettyAmount from "./PrettyAmount";

type BalanceProps = {
  address: string;
  copiable?: boolean;
  isMinified?: boolean;
  isNative?: boolean;
  asSpan?: boolean;
  prefix?: ReactNode;
  className?: string;
};

const Balance: FC<BalanceProps> = ({
  address,
  copiable = false,
  isMinified,
  isNative = false,
  asSpan = false,
  prefix,
  className,
}) => {
  const nativeToken = useToken<AccountAsset>(address);

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
        asSpan={asSpan}
        className={className}
      />
    );
  }

  return (
    <PrettyAmount
      amount={nativeToken ? nativeToken.rawBalance : null}
      decimals={nativeToken?.decimals}
      currency={nativeToken?.symbol}
      isMinified={isMinified ?? false}
      copiable={copiable}
      prefix={prefix}
      asSpan={asSpan}
      className={className}
    />
  );
};

export default Balance;
