import { FC, useCallback, useState } from "react";
import classNames from "clsx";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { RadioGroupItemProps } from "@radix-ui/react-radio-group";

import { AddAccountStep } from "app/defaults";
import { useSteps } from "app/hooks/steps";
import AddAccountHeader from "app/components/blocks/AddAccountHeader";
import AddAccountContinueButton from "app/components/blocks/AddAccountContinueButton";

const SelectAccountsToAddMethod: FC = () => {
  const { navigateToStep } = useSteps();

  const [activeMethod, setActiveMethod] = useState("auto");

  const handleContinue = useCallback(() => {
    navigateToStep(
      activeMethod === "auto"
        ? AddAccountStep.SelectAccountsToAddMethod
        : AddAccountStep.VerifyToAdd
    );
  }, [activeMethod, navigateToStep]);

  return (
    <>
      <AddAccountHeader className="mb-8">Add Wallet</AddAccountHeader>
      <div className="flex flex-col max-w-[55rem] mx-auto">
        <RadioGroupPrimitive.Root
          className="flex"
          defaultValue="auto"
          onValueChange={(value) => setActiveMethod(value)}
        >
          <RadioGroup
            value="auto"
            activeValue={activeMethod}
            title="Auto (Recommended)"
            description="Scanning the first 20 wallets from Secret Phrase for a positive balance. For every known network (mainnet). If you have more wallets - you can also add them later."
            className="mr-6"
          />
          <RadioGroup
            value="manual"
            activeValue={activeMethod}
            title="Manual"
            description="Choose which of the wallets belonging to the Secret Phrase you wish to add."
          />
        </RadioGroupPrimitive.Root>
      </div>
      <AddAccountContinueButton onContinue={handleContinue} />
    </>
  );
};

type RadioGroupProps = RadioGroupItemProps & {
  activeValue: string;
  title: string;
  description: string;
};

const RadioGroup: FC<RadioGroupProps> = ({
  activeValue,
  title,
  description,
  className,
  value,
  ...rest
}) => (
  <RadioGroupPrimitive.Item
    {...rest}
    value={value}
    className={classNames(
      "flex",
      "bg-brand-main/[.05]",
      "w-full py-8 px-6",
      "rounded-[.625rem]",
      "transition-colors",
      "hover:bg-brand-main/10",
      activeValue === value && "bg-brand-main/10",
      className
    )}
  >
    <span
      className={classNames(
        "relative",
        "w-6 min-w-[1.5rem] h-6 mt-1 mr-3",
        "bg-brand-main/10",
        "rounded-full",
        "flex justify-center items-center"
      )}
    >
      <RadioGroupPrimitive.Indicator className="bg-radio w-3 h-3 rounded-full" />
    </span>
    <span className="flex flex-col text-left">
      <span className="mb-3 text-2xl font-bold">{title}</span>
      <span className="text-base text-brand-inactivelight">{description}</span>
    </span>
  </RadioGroupPrimitive.Item>
);

export default SelectAccountsToAddMethod;
