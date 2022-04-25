import { FC, ReactNode } from "react";
import classNames from "clsx";
import BigNumber from "bignumber.js";
import { useAtomValue } from "jotai";
import { followCursor } from "tippy.js";

import { currentLocaleAtom } from "app/atoms";

import CopiableTooltip from "./CopiableTooltip";

BigNumber.set({ EXPONENTIAL_AT: 38 });

export type PrettyAmountProps = {
  amount: BigNumber.Value | null;
  decimals?: number;
  currency?: string;
  currencyCode?: string;
  isMinified?: boolean;
  copiable?: boolean;
  prefix?: ReactNode;
  USDAmount?: boolean;
  className?: string;
};

const PrettyAmount: FC<PrettyAmountProps> = ({
  amount,
  decimals = 0,
  currency,
  currencyCode,
  isMinified,
  copiable = false,
  prefix,
  USDAmount,
  className,
}) => {
  const currentLocale = useAtomValue(currentLocaleAtom);

  const amountExist = amount !== null;
  const bigNumberAmount = new BigNumber(amount ?? 0);
  const convertedAmount = bigNumberAmount.div(10 ** decimals);
  const integerPart = convertedAmount.decimalPlaces(0);
  const decimalPlaces = convertedAmount.toString().split(".")[1];

  const isFiatMinified = USDAmount && (convertedAmount.gte(0.01) || isMinified);

  let decSplit = isMinified || isFiatMinified ? 2 : 6;
  if (integerPart.gte(1_000)) {
    decSplit = 2;
  }

  const finalDecLength = decimalPlaces
    ? isFiatMinified
      ? 2
      : decimalPlaces.length
    : 0;

  let isShownDecTooltip = false;
  if (finalDecLength > decSplit) {
    isShownDecTooltip = true;
  }

  const isShownIntTooltip =
    integerPart.toString().length > (isMinified ? 3 : 6);

  let tooltipContent = getPrettyAmount({
    value: isFiatMinified
      ? convertedAmount.decimalPlaces(
          2,
          convertedAmount.gte(0.01) ? BigNumber.ROUND_DOWN : BigNumber.ROUND_UP
        )
      : convertedAmount,
    dec: isMinified ? 3 : undefined,
    currencySymbol: currency,
    currencyCode,
    locale: currentLocale,
  });
  let content = getPrettyAmount({
    value: isFiatMinified
      ? convertedAmount.decimalPlaces(
          2,
          convertedAmount.gte(0.01) ? BigNumber.ROUND_DOWN : BigNumber.ROUND_UP
        )
      : convertedAmount,
    dec: isMinified ? 3 : undefined,
    currencySymbol: currency,
    currencyCode,
    locale: currentLocale,
  });

  if (isShownIntTooltip) {
    content = getPrettyAmount({
      value: convertedAmount,
      dec: isMinified ? 3 : 6,
      currencySymbol: currency,
      currencyCode,
      locale: currentLocale,
    });

    tooltipContent = getPrettyAmount({
      value: isFiatMinified
        ? convertedAmount.decimalPlaces(2, BigNumber.ROUND_DOWN)
        : convertedAmount,
      dec: 38,
      currencyCode,
      locale: currentLocale,
    });
  }

  if (isShownDecTooltip && !isShownIntTooltip) {
    content = getPrettyAmount({
      value: convertedAmount.decimalPlaces(decSplit, BigNumber.ROUND_DOWN),
      dec: isMinified ? 3 : undefined,
      locale: currentLocale,
      currencySymbol: currency,
      currencyCode,
      withTooltip: true,
    });

    tooltipContent = getPrettyAmount({
      value: convertedAmount,
      currencySymbol: currency,
      currencyCode,
      locale: currentLocale,
    });
  }

  className = classNames(className, "whitespace-nowrap");

  if (!amountExist) {
    className = classNames(className, "invisible pointer-events-none");
  }

  const children = (
    <>
      {prefix}
      <AmountWithCurrency
        amount={content}
        locale={currentLocale}
        currency={currency}
        currencyCode={currencyCode}
      />
    </>
  );

  if (copiable) {
    return (
      <CopiableTooltip
        content={
          <AmountWithCurrency
            amount={tooltipContent}
            locale={currentLocale}
            currency={currency}
            currencyCode={currencyCode}
          />
        }
        textToCopy={tooltipContent}
        followCursor
        plugins={[followCursor]}
        asChild
        className={className}
      >
        {children}
      </CopiableTooltip>
    );
  }

  return <span className={className}>{children}</span>;
};

export default PrettyAmount;

type AmountCurrencyType = {
  amount: string;
  locale?: string;
  currency?: string;
  currencyCode?: string;
};

const AmountWithCurrency: FC<AmountCurrencyType> = ({
  amount,
  locale = "en-US",
  currency,
  currencyCode,
}) => {
  if (!currency || !currencyCode || isNaN(Number(amount))) {
    return <>{amount}</>;
  }

  return (
    <>
      {Intl.NumberFormat(locale, {
        style: "currency",
        currency: currencyCode,
      }).format(Number(amount))}
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
  locale = "en-US",
  currencySymbol,
  currencyCode = "USD",
  withTooltip = false,
}: {
  value: number | BigNumber;
  dec?: number;
  locale?: string;
  currencySymbol?: string;
  currencyCode?: string;
  withTooltip?: boolean;
}) => {
  if (new BigNumber(value).decimalPlaces(0).toString().length > dec) {
    const isLargerThenTrillion = new BigNumber(value).gt(1e18);
    const minFract = isLargerThenTrillion ? 0 : 2;
    const maxFract = isLargerThenTrillion ? 0 : dec > 4 ? 3 : 2;

    if (currencySymbol) {
      let finalValue = Intl.NumberFormat(locale, {
        minimumFractionDigits: minFract,
        maximumFractionDigits: maxFract,
        notation: "compact",
      } as any).format(+value);
      const finalSplitLetter = finalValue.slice(-1);
      if (checkIfObjectsKey(finalSplitLetter)) {
        finalValue = `${new BigNumber(value)
          .div(currenciesCompacts[finalSplitLetter])
          .decimalPlaces(maxFract, BigNumber.ROUND_DOWN)
          .toString()}${finalSplitLetter}`;
      }
      return currencySymbol + " " + finalValue;
    } else {
      const finalValue = new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currencyCode,
        minimumFractionDigits: minFract,
        maximumFractionDigits: maxFract,
        notation: "compact",
      } as any).format(+value);
      return finalValue;
    }
  }

  if (currencySymbol) {
    return (
      currencySymbol +
      " " +
      `${new Intl.NumberFormat(locale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 20,
      }).format(+value)}${withTooltip ? "..." : ""}`
    );
  } else {
    return `${new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 20,
    }).format(+value)}${withTooltip ? "..." : ""}`;
  }
};
