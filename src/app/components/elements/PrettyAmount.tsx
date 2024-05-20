import { FC, memo, ReactNode } from "react";
import classNames from "clsx";
import BigNumber from "bignumber.js";
import { useAtomValue } from "jotai";
import { followCursor } from "tippy.js";
import memoize from "mem";

import { currentLocaleAtom } from "app/atoms";

import CopiableTooltip from "./CopiableTooltip";

export type PrettyAmountProps = {
  amount: BigNumber.Value | null;
  decimals?: number;
  currency?: string;
  isFiat?: boolean;
  isMinified?: boolean;
  isThousandsMinified?: boolean;
  isDecimalsMinified?: boolean;
  copiable?: boolean;
  asSpan?: boolean;
  prefix?: ReactNode;
  threeDots?: boolean;
  className?: string;
};

const PrettyAmount = memo<PrettyAmountProps>(
  ({
    amount,
    decimals,
    currency,
    isFiat = false,
    isMinified = false,
    isThousandsMinified = true,
    isDecimalsMinified = false,
    copiable = false,
    asSpan = false,
    prefix,
    threeDots = true,
    className,
  }) => {
    const currentLocale = useAtomValue(currentLocaleAtom);

    const amountExist = amount !== null;
    const bigNumberAmount = new BigNumber(amount ?? 0);

    const convertedAmount = bigNumberAmount.div(
      new BigNumber(10).pow(decimals ?? 0),
    );
    const integerPart = convertedAmount.decimalPlaces(0);
    const decimalPlaces = convertedAmount.toString().split(".")[1];

    const isFiatMinified = isFiat && convertedAmount.gte(0.01);
    const isFiatDecimalsMinified = isFiat && isDecimalsMinified;

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
      integerPart.toString().length >
      (isMinified && isThousandsMinified ? 3 : 6);

    const zeroDecimals = !isFiat && decimals === 0;

    let tooltipContent = getPrettyAmount({
      value: isFiatMinified
        ? convertedAmount.decimalPlaces(
            2,
            convertedAmount.gte(0.01)
              ? BigNumber.ROUND_DOWN
              : BigNumber.ROUND_UP,
          )
        : convertedAmount,
      dec: isMinified && isThousandsMinified ? 3 : undefined,
      zeroDecimals,
      locale: currentLocale,
      isFiat,
      currency,
    });
    let contentToCopy = getPrettyAmount({
      value: isFiatMinified
        ? convertedAmount.decimalPlaces(
            2,
            convertedAmount.gte(0.01)
              ? BigNumber.ROUND_DOWN
              : BigNumber.ROUND_UP,
          )
        : convertedAmount,
      dec: isMinified && isThousandsMinified ? 3 : undefined,
      zeroDecimals,
      locale: currentLocale,
      useGrouping: false,
      isDecimalsMinified,
    });
    let content = getPrettyAmount({
      value: isFiatMinified
        ? convertedAmount.decimalPlaces(
            2,
            convertedAmount.gte(0.01)
              ? BigNumber.ROUND_DOWN
              : BigNumber.ROUND_UP,
          )
        : convertedAmount,
      dec: isMinified && isThousandsMinified ? 3 : undefined,
      zeroDecimals,
      locale: currentLocale,
      isFiat,
      currency,
      isDecimalsMinified,
    });

    if (isShownIntTooltip) {
      content = getPrettyAmount({
        value: convertedAmount,
        dec: isMinified && isThousandsMinified ? 3 : 6,
        zeroDecimals,
        locale: currentLocale,
        isFiat,
        currency,
        isDecimalsMinified,
      });

      tooltipContent = getPrettyAmount({
        value: isFiatMinified
          ? convertedAmount.decimalPlaces(2, BigNumber.ROUND_DOWN)
          : convertedAmount,
        dec: 38,
        zeroDecimals,
        locale: currentLocale,
        isFiat,
        currency,
      });

      contentToCopy = getPrettyAmount({
        value: isFiatMinified
          ? convertedAmount.decimalPlaces(2, BigNumber.ROUND_DOWN)
          : convertedAmount,
        dec: 38,
        zeroDecimals,
        locale: currentLocale,
        useGrouping: false,
        isDecimalsMinified,
      });
    }

    if (isShownDecTooltip && !isShownIntTooltip) {
      content = getPrettyAmount({
        value: convertedAmount.decimalPlaces(
          isFiatDecimalsMinified ? 2 : decSplit,
          isFiatDecimalsMinified ? BigNumber.ROUND_UP : BigNumber.ROUND_DOWN,
        ),
        dec: isMinified && isThousandsMinified ? 3 : undefined,
        zeroDecimals,
        locale: currentLocale,
        threeDots,
        isFiat,
        currency,
        isDecimalsMinified,
      });

      tooltipContent = getPrettyAmount({
        value: convertedAmount,
        locale: currentLocale,
        isFiat,
        currency,
      });

      contentToCopy = getPrettyAmount({
        value: convertedAmount,
        locale: currentLocale,
        useGrouping: false,
        isDecimalsMinified,
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
          textToCopy={contentToCopy}
          followCursor
          plugins={[followCursor]}
          asChild
          asSpan={asSpan}
          className={className}
        >
          {children}
        </CopiableTooltip>
      );
    }

    return <span className={className}>{children}</span>;
  },
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
    <span>
      {amount}
      {!isFiat && (
        <>
          {" "}
          <span>{currency}</span>
        </>
      )}
    </span>
  );
};

export const getPrettyAmount = ({
  value,
  dec = 6,
  zeroDecimals,
  locale = "en-US",
  useGrouping = true,
  isFiat = false,
  currency,
  threeDots = false,
  isDecimalsMinified = false,
}: {
  value: number | BigNumber;
  dec?: number;
  locale?: string;
  zeroDecimals?: boolean;
  useGrouping?: boolean;
  isFiat?: boolean;
  currency?: string;
  threeDots?: boolean;
  isDecimalsMinified?: boolean;
}) => {
  if (new BigNumber(value).decimalPlaces(0).toString().length > dec) {
    const isLargerThenTrillion = new BigNumber(value).gt(1e16);
    const minFract = isLargerThenTrillion || zeroDecimals ? 0 : 2;
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
      useGrouping,
      isFiat ? "currency" : undefined,
      isFiat ? currency : undefined,
    )
      .format(+minifiedFractions)
      .replace("US$", "$");
  }

  return `${getIntlNumberFormat(
    locale,
    zeroDecimals ? 0 : 2,
    20,
    "standard",
    useGrouping,
    isFiat ? "currency" : undefined,
    isFiat ? currency : undefined,
  )
    .format(+value)
    .replace("US$", "$")}${threeDots && !isDecimalsMinified ? "..." : ""}`;
};

const getIntlNumberFormat = memoize(
  (
    locale: string,
    minimumFractionDigits: number,
    maximumFractionDigits: number,
    notation?: "standard" | "scientific" | "engineering" | "compact",
    useGrouping?: boolean,
    style?: "currency",
    currency?: string,
  ) =>
    new Intl.NumberFormat(locale, {
      minimumFractionDigits,
      maximumFractionDigits,
      notation,
      useGrouping,
      style,
      currency,
    }),
  {
    cacheKey: (args) => args.join(),
  },
);

const minifyFractions = (
  value: BigNumber.Value,
  maxRound: number,
  fractions: number,
) => {
  const multiplier = new BigNumber(10).pow(fractions);

  return new BigNumber(value)
    .div(multiplier)
    .decimalPlaces(maxRound, BigNumber.ROUND_DOWN)
    .multipliedBy(multiplier);
};
