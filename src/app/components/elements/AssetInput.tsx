import { forwardRef } from "react";

import NumberInput, { NumberInputProps } from "./NumberInput";

type AssetInputProps = NumberInputProps & {
  assetDecimals?: number;
};

const AssetInput = forwardRef<HTMLInputElement, AssetInputProps>(
  ({ assetDecimals = 18, ...rest }, ref) => {
    return <NumberInput ref={ref} decimalScale={assetDecimals} {...rest} />;
  }
);

export default AssetInput;
