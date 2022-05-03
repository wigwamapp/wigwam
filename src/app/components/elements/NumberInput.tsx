import { forwardRef, memo, useRef } from "react";
import NumberFormat, { NumberFormatProps } from "react-number-format";

import Input, { InputProps } from "./Input";

export type NumberInputProps = Omit<NumberFormatProps, "type"> &
  Omit<InputProps, "ref" | "value" | "defaultValue" | "type" | "onChange"> & {
    defaultValue?: string | number;
    value?: string | number;
    decimalSeparator?: string;
  };

const NumberInput = memo(
  forwardRef<HTMLInputElement, NumberInputProps>(
    ({ allowNegative = false, onChange, ...rest }, ref) => {
      const prevValueRef = useRef<string>();

      return (
        <NumberFormat
          getInputRef={ref}
          customInput={Input}
          allowNegative={allowNegative}
          onValueChange={({ value }, { source, event }) => {
            if (source === "event" && value !== prevValueRef.current) {
              prevValueRef.current = value;
              Object.assign(event, { target: { value } });
              onChange?.(event);
            }
          }}
          {...rest}
        />
      );
    }
  )
);

export default NumberInput;
