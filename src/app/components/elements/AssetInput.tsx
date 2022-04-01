import { forwardRef } from "react";
import classNames from "clsx";

import NumberInput, { NumberInputProps } from "./NumberInput";

type AssetInputProps = NumberInputProps & {
  assetDecimals?: number;
  withMaxButton?: boolean;
  handleMaxButtonClick?: () => void;
};

const AssetInput = forwardRef<HTMLInputElement, AssetInputProps>(
  (
    {
      assetDecimals = 18,
      withMaxButton = false,
      handleMaxButtonClick,
      ...rest
    },
    ref
  ) => {
    return (
      <NumberInput
        ref={ref}
        decimalScale={assetDecimals}
        labelActions={
          withMaxButton ? (
            <button
              type="button"
              onClick={handleMaxButtonClick}
              className={classNames(
                "py-1 px-3",
                "bg-brand-main/10",
                "rounded-md",
                "text-xs font-bold",
                "transition-colors",
                "hover:bg-brand-main/30 hover:shadow-buttonsecondary",
                "focus-visible:bg-brand-main/30 focus-visible:shadow-buttonsecondary",
                "active:bg-brand-main/20 active:shadow-none"
              )}
            >
              MAX
            </button>
          ) : undefined
        }
        {...rest}
      />
    );
  }
);

export default AssetInput;
