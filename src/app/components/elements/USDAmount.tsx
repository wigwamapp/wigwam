import { FC } from "react";
import { currenciesRateAtom, selectedCurrencyAtom } from "app/atoms";
import BigNumber from "bignumber.js";
import { useAtomValue } from "jotai";

import { CONVERSION_CURRENCIES } from "fixtures/conversionCurrency";
import PrettyAmount, { PrettyAmountProps } from "./PrettyAmount";

type USDAmountProps = PrettyAmountProps;

const USDAmount: FC<USDAmountProps> = ({ amount, ...props }) => {
  const currenciesRate = useAtomValue(currenciesRateAtom);
  const selectedCurrency = useAtomValue(selectedCurrencyAtom);

  const isContverted = props.currency ? true : false;
  const isFiat =
    !props.currency?.includes("ETH") && !props.currency?.includes("BTC");

  const value = isContverted
    ? amount
    : convert(amount, currenciesRate[selectedCurrency.value.split(" - ")[1]]);

  const units =
    props.currency ??
    CONVERSION_CURRENCIES.find(
      (CUR) => CUR.name === selectedCurrency.value.split(" - ")[1]
    )?.unit;

  return (
    <PrettyAmount
      {...props}
      amount={isFiat ? fiatFormat(value) : value}
      currency={units}
    />
  );
};

export default USDAmount;

const fiatFormat = (amount: BigNumber.Value | null) => {
  const bigNumberAmount = new BigNumber(amount ?? 0);
  return bigNumberAmount.toFixed(2);
};

const convert = (amount: BigNumber.Value | null, rate: number) => {
  const bigNumberAmount = new BigNumber(amount ?? 0);
  return bigNumberAmount.multipliedBy(Number(rate));
};
