import { FC } from "react";
import { currenciesRateAtom, selectedCurrencyAtom } from "app/atoms";
import BigNumber from "bignumber.js";
import { useAtomValue } from "jotai";

import PrettyAmount, { PrettyAmountProps } from "./PrettyAmount";

type FiatAmountProps = Omit<PrettyAmountProps, "isFiat" | "currency">;

const FiatAmount: FC<FiatAmountProps> = ({ amount, ...rest }) => {
  const currenciesRate = useAtomValue(currenciesRateAtom);
  const selectedCurrency = useAtomValue(selectedCurrencyAtom);

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
