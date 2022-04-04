import { FC, useState } from "react";
import classNames from "clsx";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { RadioGroupItemProps } from "@radix-ui/react-radio-group";

import Collapse from "app/components/elements/Collapse";
import Input from "app/components/elements/Input";
import AddAccountHeader from "app/components/blocks/AddAccountHeader";
import AddAccountContinueButton from "app/components/blocks/AddAccountContinueButton";

type MethodProps = {
  value: string;
  title: string;
  description: string;
};

export type MethodsProps = [MethodProps, MethodProps];

type SelectAddMethodProps = {
  methods: MethodsProps;
  onContinue: (method: string) => void;
};

const SelectAddMethod: FC<SelectAddMethodProps> = ({ methods, onContinue }) => {
  const [activeMethod, setActiveMethod] = useState(methods[0].value);

  return (
    <>
      <AddAccountHeader className="mb-8">Add Wallet</AddAccountHeader>
      <div className="flex flex-col max-w-[55rem] mx-auto grow">
        <RadioGroupPrimitive.Root
          className="grid grid-cols-2 gap-6 mb-auto"
          value={activeMethod}
          onValueChange={(value) => setActiveMethod(value)}
        >
          {methods.map(({ value, title, description }) => (
            <RadioGroup
              key={value}
              value={value}
              activeValue={activeMethod}
              title={title}
              description={description}
            />
          ))}
        </RadioGroupPrimitive.Root>
        <Collapse label="Customize Derivation path" className="mt-12 mb-8">
          <div className="max-w-[17.5rem]">
            <p className="mb-3 text-sm">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit ut aliquam
            </p>
            <Input defaultValue="m/44'/60'/0'/0/{index}" />
          </div>
        </Collapse>
      </div>
      <AddAccountContinueButton onContinue={() => onContinue(activeMethod)} />
    </>
  );
};

export default SelectAddMethod;

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
