import React, { forwardRef, memo } from "react";
import NumberFormat, { NumberFormatProps } from "react-number-format";

import Input, { InputProps } from "./Input";

type NumberInputProps = Omit<NumberFormatProps, "type"> &
  Omit<InputProps, "ref" | "value" | "defaultValue" | "type"> & {
    defaultValue?: string | number;
    value?: string | number;
    decimalSeparator?: string;
  };

const NumberInput = memo(
  forwardRef<HTMLInputElement, NumberInputProps>(
    ({ allowNegative = false, ...rest }, ref) => {
      return (
        <NumberFormat
          getInputRef={ref}
          customInput={Input}
          allowNegative={allowNegative}
          {...rest}
        />
      );
    }
  )
);

export default NumberInput;
