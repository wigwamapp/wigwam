import { FC } from "react";
import { currenciesRateAtom, selectedCurrencyAtom } from "app/atoms";
import BigNumber from "bignumber.js";
import { useAtomValue } from "jotai";

import PrettyAmount, { PrettyAmountProps } from "./PrettyAmount";

type USDAmountProps = PrettyAmountProps;

const USDAmount: FC<USDAmountProps> = ({ amount, ...props }) => {
  const currenciesRate = useAtomValue(currenciesRateAtom);
  const selectedCurrency = useAtomValue(selectedCurrencyAtom);

  const isContverted = props.currency ? true : false;

  const isCoin = props.currencyCode
    ? isBTCorETH(props.currencyCode)
    : isBTCorETH(selectedCurrency);

  const value = isContverted
    ? amount
    : convert(amount, currenciesRate[selectedCurrency]);

  return (
    <PrettyAmount
      {...props}
      amount={isCoin ? value : fiatFormat(value)}
      currencyCode={selectedCurrency}
      USDAmount
    />
  );
};

export default USDAmount;

const fiatFormat = (amount: BigNumber.Value) => {
  const bigNumberAmount = new BigNumber(amount);
  return bigNumberAmount.toFixed(2);
};

const convert = (amount: BigNumber.Value, rate: number) => {
  const bigNumberAmount = new BigNumber(amount);
  return bigNumberAmount.multipliedBy(Number(rate));
};

type COIN = "ETH" | "BTC";
const isBTCorETH = (currency: string): currency is COIN =>
  currency === "ETH" || currency === "BTC";
