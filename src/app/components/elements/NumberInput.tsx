import { forwardRef, memo, useMemo, useRef } from "react";
import NumberFormat, { NumberFormatProps } from "react-number-format";
import { useAtomValue } from "jotai";

import {
  DEFAULT_LOCALES_SEPARATORS,
  FALLBACK_LOCALE_SEPARATORS,
} from "fixtures/locales";

import { currentLocaleAtom } from "app/atoms";
import Input, { InputProps } from "./Input";

export type NumberInputProps = Omit<NumberFormatProps, "type"> &
  Omit<InputProps, "ref" | "value" | "defaultValue" | "type" | "onChange"> & {
    defaultValue?: string | number;
    value?: string | number;
    decimalSeparator?: string;
  };

const NumberInput = memo(
  forwardRef<HTMLInputElement, NumberInputProps>(
    ({ allowNegative = false, value, onChange, ...rest }, ref) => {
      const currentLocale = useAtomValue(currentLocaleAtom);

      const prevValueRef = useRef<string>();
      const separators = useMemo(
        () =>
          DEFAULT_LOCALES_SEPARATORS.find(
            ({ code }) => currentLocale === code
          ) ?? FALLBACK_LOCALE_SEPARATORS,
        [currentLocale]
      );

      value = value?.toString()?.replace(".", separators.decimals);

      return (
        <NumberFormat
          getInputRef={ref}
          customInput={Input}
          allowNegative={allowNegative}
          value={value}
          onValueChange={({ value }, { source, event }) => {
            if (source === "event" && value !== prevValueRef.current) {
              prevValueRef.current = value;
              Object.assign(event, {
                target: { value },
              });
              onChange?.(event);
            }
          }}
          {...rest}
          thousandSeparator={separators.thousands}
          decimalSeparator={separators.decimals}
          allowedDecimalSeparators={[",", "."]}
        />
      );
    }
  )
);

export default NumberInput;
