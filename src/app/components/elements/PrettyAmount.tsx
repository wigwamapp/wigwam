import { FC, useRef } from "react";
import BigNumber from "bignumber.js";
import { useAtomValue } from "jotai";
import { followCursor } from "tippy.js";
import classNames from "clsx";
import { useCopyToClipboard } from "lib/react-hooks/useCopyToClipboard";

import { currentLocaleAtom } from "app/atoms";
import Tooltip from "app/components/elements/Tooltip";

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

  const fieldRef = useRef<HTMLInputElement>(null);
  const { copy, copied } = useCopyToClipboard(fieldRef);

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

  const isWithDots = convertedAmount
    .decimalPlaces(decSplit, BigNumber.ROUND_DOWN)
    .gt(0);

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
      dec: 1e38,
      locale: currentLocale,
    });
  }

  if (isShownDecTooltip) {
    content = getPrettyAmount({
      value: convertedAmount.decimalPlaces(decSplit, BigNumber.ROUND_DOWN),
      dec: isMinified ? 3 : undefined,
      locale: currentLocale,
      withTooltip: isWithDots,
    });

    tooltipContent = getPrettyAmount({
      value: convertedAmount,
      locale: currentLocale,
    });
  }

  if (copiable) {
    return (
      <Tooltip
        content={
          copied ? (
            "Copied"
          ) : (
            <AmountWithCurrency amount={tooltipContent} currency={currency} />
          )
        }
        followCursor
        plugins={[followCursor]}
        asChild
        duration={[100, 50]}
      >
        <button
          type="button"
          onPointerDown={(e) => e.preventDefault()}
          onClick={copy}
          className={classNames("cursor-pointer", className)}
        >
          <input
            ref={fieldRef}
            value={tooltipContent}
            onChange={() => undefined}
            tabIndex={-1}
            className="sr-only"
          />
          <AmountWithCurrency amount={content} currency={currency} />
        </button>
      </Tooltip>
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
