import { forwardRef, memo, useMemo, useRef } from "react";
import { NumericFormat, NumericFormatProps } from "react-number-format";
import { useAtomValue } from "jotai";

import {
  DEFAULT_LOCALES_SEPARATORS,
  FALLBACK_LOCALE_SEPARATORS,
} from "fixtures/locales";

import { currentLocaleAtom } from "app/atoms";
import Input, { InputProps } from "./Input";

export type NumberInputProps = Omit<NumericFormatProps, "type"> &
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
            ({ code }) => currentLocale === code,
          ) ?? FALLBACK_LOCALE_SEPARATORS,
        [currentLocale],
      );

      value = value?.toString()?.replace(".", separators.decimals);

      return (
        <NumericFormat
          getInputRef={ref}
          customInput={Input}
          allowNegative={allowNegative}
          value={value}
          onValueChange={({ value }, { source, event }) => {
            if (event && source === "event" && value !== prevValueRef.current) {
              prevValueRef.current = value;
              Object.assign(event, {
                target: { value },
              });
              onChange?.(event as any);
            }
          }}
          {...rest}
          thousandSeparator={
            rest.thousandSeparator !== false && separators.thousands
          }
          decimalSeparator={separators.decimals}
          allowedDecimalSeparators={[",", "."]}
        />
      );
    },
  ),
);

export default NumberInput;
