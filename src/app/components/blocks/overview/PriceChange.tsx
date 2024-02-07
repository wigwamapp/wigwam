import { FC } from "react";
import BigNumber from "bignumber.js";
import classNames from "clsx";

import PrettyAmount from "app/components/elements/PrettyAmount";
import PriceArrow from "app/components/elements/PriceArrow";
import FiatAmount from "app/components/elements/FiatAmount";

type PriceChangeProps = {
  priceChange: BigNumber.Value;
  isPercent?: boolean;
  className?: string;
  textClassName?: string;
  hideBackground?: boolean;
};

const PriceChange: FC<PriceChangeProps> = ({
  priceChange,
  isPercent = false,
  hideBackground = false,
  className,
  textClassName,
}) => {
  const priceChangeNumber = +priceChange;

  if (!priceChangeNumber) {
    return <></>;
  }

  const isPositive = priceChangeNumber >= 0;
  const value = new BigNumber(priceChange).abs().toFixed(2);

  return (
    <span
      className={classNames(
        "inline-flex items-center",
        isPercent && "text-sm leading-4",
        "font-bold",
        isPercent && "py-1 px-2",
        "rounded-md",
        !hideBackground && isPositive && isPercent && "bg-[#4F9A5E]",
        !hideBackground && !isPositive && isPercent && "bg-[#B82D41]",
        isPositive && (!isPercent || hideBackground) && "text-[#6BB77A]",
        !isPositive && (!isPercent || hideBackground) && "text-[#EA556A]",
        className,
      )}
    >
      {isPercent ? (
        <PrettyAmount
          prefix={
            <PriceArrow
              className={classNames(
                "w-2.5 h-2.5 mr-[0.2rem]",
                !isPositive && "transform rotate-180",
              )}
            />
          }
          amount={value}
          isDecimalsMinified={true}
          className={classNames("inline-flex items-center", textClassName)}
        />
      ) : (
        <FiatAmount
          prefix={isPositive ? "+" : "-"}
          amount={value}
          isDecimalsMinified={true}
          copiable
          className={classNames("text-lg font-semibold", textClassName)}
        />
      )}
      {isPercent ? "%" : ""}
    </span>
  );
};

export default PriceChange;
