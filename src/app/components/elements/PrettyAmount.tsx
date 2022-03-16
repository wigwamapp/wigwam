import { FC } from "react";
import BigNumber from "bignumber.js";
import { useAtomValue } from "jotai";
import { followCursor } from "tippy.js";

import { currentLocaleAtom } from "app/atoms";

import CopiableTooltip from "./CopiableTooltip";

BigNumber.set({ EXPONENTIAL_AT: 38 });

type PrettyAmountProps = {
  amount: string | number | BigNumber;
  decimals?: number;
  currency?: string;
  isMinified?: boolean;
  copiable?: boolean;
  className?: string;
};

const PrettyAmount: FC<PrettyAmountProps> = ({
  amount,
  decimals = 0,
  currency,
  isMinified,
  copiable = false,
  className,
}) => {
  const currentLocale = useAtomValue(currentLocaleAtom);

  const bigNumberAmount = new BigNumber(amount);
  if (!bigNumberAmount) {
    return <></>;
  }

  const convertedAmount = bigNumberAmount.div(10 ** decimals);
  const integerPart = convertedAmount.decimalPlaces(0);
  const decimalPlaces = convertedAmount.toString().split(".")[1];

  let decSplit = isMinified ? 2 : 6;
  if (integerPart.gte(1_000)) {
    decSplit = 2;
  }

  const finalDecLength = decimalPlaces ? decimalPlaces.length : 0;

  let isShownDecTooltip = false;
  if (finalDecLength > decSplit) {
    isShownDecTooltip = true;
  }

  const isShownIntTooltip =
    integerPart.toString().length > (isMinified ? 3 : 6);

  let tooltipContent = getPrettyAmount({
    value: convertedAmount,
    dec: isMinified ? 3 : undefined,
    locale: currentLocale,
  });
  let content = getPrettyAmount({
    value: convertedAmount,
    dec: isMinified ? 3 : undefined,
    locale: currentLocale,
  });

  if (isShownIntTooltip) {
    content = getPrettyAmount({
      value: convertedAmount,
      dec: isMinified ? 3 : 6,
      locale: currentLocale,
    });

    tooltipContent = getPrettyAmount({
      value: convertedAmount,
      dec: 38,
      locale: currentLocale,
    });
  }

  if (isShownDecTooltip && !isShownIntTooltip) {
    content = getPrettyAmount({
      value: convertedAmount.decimalPlaces(decSplit, BigNumber.ROUND_DOWN),
      dec: isMinified ? 3 : undefined,
      locale: currentLocale,
      withTooltip: true,
    });

    tooltipContent = getPrettyAmount({
      value: convertedAmount,
      locale: currentLocale,
    });
  }

  const contentNode = (
    <AmountWithCurrency amount={tooltipContent} currency={currency} />
  );

  if (copiable) {
    return (
      <CopiableTooltip
        content={contentNode}
        textToCopy={tooltipContent}
        className={className}
        followCursor
        plugins={[followCursor]}
        asChild
        duration={[100, 50]}
      >
        <AmountWithCurrency amount={content} currency={currency} />
      </CopiableTooltip>
    );
  }

  return (
    <span className={className}>
      <AmountWithCurrency amount={content} currency={currency} />
    </span>
  );
};

export default PrettyAmount;

const AmountWithCurrency: FC<{ amount: string; currency?: string }> = ({
  amount,
  currency,
}) => {
  if (!currency) {
    return <>{amount}</>;
  }

  return (
    <>
      {currency === "$" && <span>$</span>}
      {amount}
      {currency !== "$" && (
        <>
          {" "}
          <span>{currency}</span>
        </>
      )}
    </>
  );
};

const checkIfObjectsKey = (key: string) =>
  key === "K" || key === "M" || key === "B" || key === "T";

const currenciesCompacts: {
  [key: string]: number;
} = {
  K: 1e3,
  M: 1e6,
  B: 1e9,
  T: 1e12,
};

export const getPrettyAmount = ({
  value,
  dec = 6,
  locale = "en",
  withTooltip = false,
}: {
  value: number | BigNumber;
  dec?: number;
  locale?: string;
  withTooltip?: boolean;
}) => {
  if (new BigNumber(value).decimalPlaces(0).toString().length > dec) {
    let finalValue = new Intl.NumberFormat(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: dec > 4 ? 3 : 2,
      notation: "compact",
    } as any).format(+value);

    const finalSplitLetter = finalValue.slice(-1);
    if (checkIfObjectsKey(finalSplitLetter)) {
      finalValue = `${new BigNumber(value)
        .div(currenciesCompacts[finalSplitLetter])
        .decimalPlaces(dec > 4 ? 3 : 2, BigNumber.ROUND_DOWN)
        .toString()}${finalSplitLetter}`;
    }

    return finalValue;
  }

  return `${new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 20,
  }).format(+value)}${withTooltip ? "..." : ""}`;
};
