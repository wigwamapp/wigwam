import { forwardRef } from "react";

import IconedButton from "../IconedButton";
import NumberInput, { NumberInputProps } from "../NumberInput";
import { ReactComponent as MinusIcon } from "app/icons/minus.svg";
import { ReactComponent as PlusIcon } from "app/icons/plus.svg";

type PlusMinusInputProps = {
  onMinusClick: () => void;
  onPlusClick: () => void;
} & NumberInputProps;

const PlusMinusInput = forwardRef<HTMLInputElement, PlusMinusInputProps>(
  ({ onMinusClick, onPlusClick, ...rest }, ref) => (
    <NumberInput
      ref={ref}
      labelActions={
        <>
          <IconedButton
            theme="primary"
            Icon={MinusIcon}
            aria-label="Minus"
            onClick={onMinusClick}
            className="ml-auto mr-1" //!w-6 !h-6
            // iconClassName="!w-6"
          />
          <IconedButton
            theme="primary"
            Icon={PlusIcon}
            aria-label="Plus"
            onClick={onPlusClick}
            // className="!w-6 !h-6"
            // iconClassName="!w-6"
          />
        </>
      }
      {...rest}
    />
  )
);

export default PlusMinusInput;
