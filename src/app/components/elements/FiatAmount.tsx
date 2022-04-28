import { FC } from "react";
import { useAtomValue } from "jotai";
import { waitForAll } from "jotai/utils";
import BigNumber from "bignumber.js";

import { currenciesRateAtom, selectedCurrencyAtom } from "app/atoms";

import PrettyAmount, { PrettyAmountProps } from "./PrettyAmount";

type FiatAmountProps = Omit<PrettyAmountProps, "isFiat" | "currency">;

const FiatAmount: FC<FiatAmountProps> = ({ amount, ...rest }) => {
  const [currenciesRate, selectedCurrency] = useAtomValue(
    waitForAll([currenciesRateAtom, selectedCurrencyAtom])
  );

  const value = new BigNumber(amount ?? 0).multipliedBy(
    currenciesRate[selectedCurrency]
  );

  return (
    <PrettyAmount
      currency={selectedCurrency}
      isFiat={!(selectedCurrency === "ETH" || selectedCurrency === "BTC")}
      amount={value}
      {...rest}
    />
  );
};

export default FiatAmount;
