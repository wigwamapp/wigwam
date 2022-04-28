import { FC, memo, ReactNode } from "react";
import classNames from "clsx";
import BigNumber from "bignumber.js";
import { useAtomValue } from "jotai";
import { followCursor } from "tippy.js";
import memoize from "mem";

import { currentLocaleAtom } from "app/atoms";

import CopiableTooltip from "./CopiableTooltip";

BigNumber.set({ EXPONENTIAL_AT: 38 });

export type PrettyAmountProps = {
  amount: BigNumber.Value | null;
  decimals?: number;
  currency?: string;
  isFiat?: boolean;
  isMinified?: boolean;
  copiable?: boolean;
  prefix?: ReactNode;
  threeDots?: boolean;
  className?: string;
};

const PrettyAmount = memo<PrettyAmountProps>(
  ({
    amount,
    decimals = 0,
    currency,
    isFiat = false,
    isMinified = false,
    copiable = false,
    prefix,
    threeDots = true,
    className,
  }) => {
    const currentLocale = useAtomValue(currentLocaleAtom);

    const amountExist = amount !== null;
    const bigNumberAmount = new BigNumber(amount ?? 0);

    const convertedAmount = bigNumberAmount.div(10 ** decimals);
    const integerPart = convertedAmount.decimalPlaces(0);
    const decimalPlaces = convertedAmount.toString().split(".")[1];

    const isFiatMinified = isFiat && (convertedAmount.gte(0.01) || isMinified);

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
            convertedAmount.gte(0.01)
              ? BigNumber.ROUND_DOWN
              : BigNumber.ROUND_UP
          )
        : convertedAmount,
      dec: isMinified ? 3 : undefined,
      locale: currentLocale,
      isFiat,
      currency,
    });
    let content = getPrettyAmount({
      value: isFiatMinified
        ? convertedAmount.decimalPlaces(
            2,
            convertedAmount.gte(0.01)
              ? BigNumber.ROUND_DOWN
              : BigNumber.ROUND_UP
          )
        : convertedAmount,
      dec: isMinified ? 3 : undefined,
      locale: currentLocale,
      isFiat,
      currency,
    });

    if (isShownIntTooltip) {
      content = getPrettyAmount({
        value: convertedAmount,
        dec: isMinified ? 3 : 6,
        locale: currentLocale,
        isFiat,
        currency,
      });

      tooltipContent = getPrettyAmount({
        value: isFiatMinified
          ? convertedAmount.decimalPlaces(2, BigNumber.ROUND_DOWN)
          : convertedAmount,
        dec: 38,
        locale: currentLocale,
        isFiat,
        currency,
      });
    }

    if (isShownDecTooltip && !isShownIntTooltip) {
      content = getPrettyAmount({
        value: convertedAmount.decimalPlaces(decSplit, BigNumber.ROUND_DOWN),
        dec: isMinified ? 3 : undefined,
        locale: currentLocale,
        threeDots,
        isFiat,
        currency,
      });

      tooltipContent = getPrettyAmount({
        value: convertedAmount,
        locale: currentLocale,
        isFiat,
        currency,
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
          currency={currency}
          isFiat={isFiat}
        />
      </>
    );

    if (copiable) {
      return (
        <CopiableTooltip
          content={
            <AmountWithCurrency
              amount={tooltipContent}
              currency={currency}
              isFiat={isFiat}
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
  }
);

export default PrettyAmount;

const AmountWithCurrency: FC<{
  amount: string;
  currency?: string;
  isFiat?: boolean;
}> = ({ amount, currency, isFiat = false }) => {
  if (!currency) {
    return <>{amount}</>;
  }

  return (
    <>
      {amount}
      {!isFiat && (
        <>
          {" "}
          <span>{currency}</span>
        </>
      )}
    </>
  );
};

export const getPrettyAmount = ({
  value,
  dec = 6,
  locale = "en-US",
  isFiat = false,
  currency,
  threeDots = false,
}: {
  value: number | BigNumber;
  dec?: number;
  locale?: string;
  isFiat?: boolean;
  currency?: string;
  threeDots?: boolean;
}) => {
  if (new BigNumber(value).decimalPlaces(0).toString().length > dec) {
    const isLargerThenTrillion = new BigNumber(value).gt(1e16);
    const minFract = isLargerThenTrillion ? 0 : 2;
    const maxFract = isLargerThenTrillion ? 0 : dec > 4 ? 3 : 2;

    let minifiedFractions = new BigNumber(value);
    if (minifiedFractions.gte(1e9)) {
      minifiedFractions = minifyFractions(minifiedFractions, maxFract, 9);
    } else if (minifiedFractions.gte(1e6)) {
      minifiedFractions = minifyFractions(minifiedFractions, maxFract, 6);
    }

    return getIntlNumberFormat(
      locale,
      minFract,
      maxFract,
      "compact",
      isFiat ? "currency" : undefined,
      isFiat ? currency : undefined
    )
      .format(+minifiedFractions)
      .replace("US$", "$");
  }

  return `${getIntlNumberFormat(
    locale,
    2,
    20,
    "standard",
    isFiat ? "currency" : undefined,
    isFiat ? currency : undefined
  )
    .format(+value)
    .replace("US$", "$")}${threeDots ? "..." : ""}`;
};

const getIntlNumberFormat = memoize(
  (
    locale: string,
    minimumFractionDigits: number,
    maximumFractionDigits: number,
    notation?: "standard" | "scientific" | "engineering" | "compact",
    style?: "currency",
    currency?: string
  ) =>
    new Intl.NumberFormat(locale, {
      minimumFractionDigits,
      maximumFractionDigits,
      notation,
      style,
      currency,
    }),
  {
    cacheKey: (args) => args.join(),
  }
);

const minifyFractions = (
  value: BigNumber.Value,
  maxRound: number,
  fractions: number
) => {
  const multiplier = new BigNumber(10).pow(fractions);

  return new BigNumber(value)
    .div(multiplier)
    .decimalPlaces(maxRound, BigNumber.ROUND_DOWN)
    .multipliedBy(multiplier);
};
