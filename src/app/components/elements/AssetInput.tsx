import { forwardRef, useMemo } from "react";

import NumberInput, { NumberInputProps } from "./NumberInput";

export type AssetInputProps = NumberInputProps & {
  assetDecimals?: number;
  currency?: string;
};

const AssetInput = forwardRef<HTMLInputElement, AssetInputProps>(
  ({ assetDecimals = 18, currency, style, ...rest }, ref) => {
    const assetInputStyle = useMemo(
      () =>
        currency
          ? {
              paddingRight: `${(currency.length * 10 + 12 + 16) / 16}rem`,
            }
          : undefined,
      [currency],
    );

    return (
      <NumberInput
        ref={ref}
        decimalScale={Number(assetDecimals)}
        style={{ ...assetInputStyle, ...style }}
        actions={currency}
        actionsClassName="text-sm font-bold pointer-events-none !right-4"
        {...rest}
      />
    );
  },
);

export default AssetInput;
