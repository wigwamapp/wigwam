import { FC } from "react";
import { ethers } from "ethers";
import BigNumber from "bignumber.js";
import { useAtomValue } from "jotai";

import { useToken } from "app/hooks";
import { selectedCurrencyAtom } from "app/atoms";
import USDAmount from "./USDAmount";
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
  const selectedCurrency = useAtomValue(selectedCurrencyAtom);

  const protfolioBalane = nativeToken?.portfolioUSD;

  return (
    <>
      {protfolioBalane ? (
        <USDAmount
          amount={
            nativeToken
              ? protfolioBalane ??
                ethers.utils.formatEther(nativeToken.rawBalance)
              : null
          }
          currencyCode={selectedCurrency}
          isMinified={
            protfolioBalane
              ? new BigNumber(protfolioBalane).isLessThan(0.01)
              : false
          }
          copiable={copiable}
          className={className}
        />
      ) : (
        <PrettyAmount
          amount={
            nativeToken
              ? protfolioBalane ??
                ethers.utils.formatEther(nativeToken.rawBalance)
              : null
          }
          currency={nativeToken?.symbol}
          isMinified={
            protfolioBalane
              ? new BigNumber(protfolioBalane).isLessThan(0.01)
              : false
          }
          copiable={copiable}
          className={className}
        />
      )}
    </>
  );
};

export default Balance;
