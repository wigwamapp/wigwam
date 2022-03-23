import { forwardRef, useCallback, useEffect, useMemo, useState } from "react";
import BigNumber from "bignumber.js";
import classNames from "clsx";

import Input, { InputProps } from "./Input";

type AssetInputProps = Omit<InputProps, "onChange" | "ref"> & {
  value?: BigNumber.Value;
  min?: BigNumber.Value;
  max?: BigNumber.Value;
  assetDecimals?: number;
  onChange?: (v?: string) => void;
  withMaxButton?: boolean;
  handleMaxButtonClick?: () => void;
};

const AssetInput = forwardRef<HTMLInputElement, AssetInputProps>(
  (
    {
      value,
      min = 0,
      max = Number.MAX_SAFE_INTEGER,
      assetDecimals = 2,
      onChange,
      onFocus,
      onBlur,
      withMaxButton = false,
      handleMaxButtonClick,
      ...rest
    },
    ref
  ) => {
    const valueStr = useMemo(
      () => (value === undefined ? "" : new BigNumber(value).toFixed()),
      [value]
    );

    const [localValue, setLocalValue] = useState(valueStr);
    const [focused, setFocused] = useState(false);

    useEffect(() => {
      if (!focused) {
        setLocalValue(valueStr);
      }
    }, [setLocalValue, focused, valueStr]);

    const handleChange = useCallback(
      (evt) => {
        let val = evt.target.value.replace(/ /g, "").replace(/,/g, ".");
        let numVal = new BigNumber(val || 0);
        const indexOfDot = val.indexOf(".");
        if (indexOfDot !== -1 && val.length - indexOfDot > assetDecimals + 1) {
          val = val.substring(0, indexOfDot + assetDecimals + 1);
          numVal = new BigNumber(val);
        }

        if (
          !numVal.isNaN() &&
          numVal.isGreaterThanOrEqualTo(min) &&
          numVal.isLessThanOrEqualTo(max)
        ) {
          setLocalValue(val);
          if (onChange) {
            onChange(val !== "" ? numVal.toFixed() : undefined);
          }
        }
      },
      [assetDecimals, setLocalValue, min, max, onChange]
    );

    const handleFocus = useCallback(
      (evt) => {
        setFocused(true);
        onFocus?.(evt);
      },
      [setFocused, onFocus]
    );

    const handleBlur = useCallback(
      (evt) => {
        setFocused(false);
        onBlur?.(evt);
      },
      [setFocused, onBlur]
    );

    return (
      <Input
        ref={ref}
        type="text"
        value={localValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        actions={
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
