import { forwardRef } from "react";

import IconedButton from "../IconedButton";
import AssetInput, { AssetInputProps } from "../AssetInput";
import { ReactComponent as MinusIcon } from "app/icons/minus.svg";
import { ReactComponent as PlusIcon } from "app/icons/plus.svg";

type PlusMinusInputProps = {
  onMinusClick: () => void;
  onPlusClick: () => void;
} & AssetInputProps;

const PlusMinusInput = forwardRef<HTMLInputElement, PlusMinusInputProps>(
  ({ onMinusClick, onPlusClick, ...rest }, ref) => (
    <AssetInput
      ref={ref}
      labelActions={
        <>
          <IconedButton
            theme="primary"
            Icon={MinusIcon}
            onClick={onMinusClick}
            className="ml-auto mr-1" //!w-6 !h-6
            // iconClassName="!w-6"
          />
          <IconedButton
            theme="primary"
            Icon={PlusIcon}
            onClick={onPlusClick}
            // className="!w-6 !h-6"
            // iconClassName="!w-6"
          />
        </>
      }
      {...rest}
    />
  ),
);

export default PlusMinusInput;
