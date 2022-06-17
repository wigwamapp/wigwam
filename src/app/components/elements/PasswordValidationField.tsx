import { FC, forwardRef, useCallback, useState } from "react";
import classNames from "clsx";

import { InputProps } from "./Input";
import PasswordField from "./PasswordField";

type RequirementsType = "bigLetter" | "smallLetter" | "numbers" | "length";

const PasswordValidationField = forwardRef<
  HTMLInputElement,
  Omit<InputProps, "ref" | "type" | "actions">
>(({ className, onChange, ...rest }, ref) => {
  const [passwordRequirements, setPasswordRequirements] = useState<
    Record<RequirementsType, boolean>
  >({
    bigLetter: false,
    smallLetter: false,
    numbers: false,
    length: false,
  });

  const handleInputChange = useCallback(
    (e) => {
      const { value } = e.target;

      setPasswordRequirements({
        bigLetter: value.match(/(?=.*[A-Z])/),
        smallLetter: value.match(/(?=.*[a-z])/),
        numbers: value.match(/(?=.*[0-9])/),
        length: value.length >= 8,
      });

      onChange?.(e);
    },
    [onChange]
  );

  return (
    <div className={classNames("flex flex-col", className)}>
      <PasswordField ref={ref} onChange={handleInputChange} {...rest} />
      <div className="flex flex-wrap mt-2 pl-2 -mb-2">
        {Object.keys(passwordRequirements).map((key) => (
          <Tag
            key={key}
            type={key as RequirementsType}
            isActive={passwordRequirements[key as RequirementsType]}
            isError={Boolean(
              !passwordRequirements[key as RequirementsType] && rest.error
            )}
          />
        ))}
      </div>
    </div>
  );
});

export default PasswordValidationField;

type TagProps = {
  type: RequirementsType;
  isActive: boolean;
  isError: boolean;
  className?: string;
};

const Tag: FC<TagProps> = ({
  type,
  isActive = false,
  isError = false,
  className,
}) => (
  <span
    className={classNames(
      "flex items-center justify-center",
      "px-2 py-1",
      "rounded-md",
      "text-xs",
      "mr-2 mb-2",
      "transition-colors",
      !isActive && !isError && "bg-brand-main/5 text-brand-inactivedark",
      isActive && !isError && "bg-[#08923F]/20 text-[#28B048]",
      isError && "bg-brand-redtext/20 text-brand-redtext",
      className
    )}
  >
    {getLabel(type)}
  </span>
);

const getLabel = (key: string) => {
  switch (key) {
    case "bigLetter":
      return "1 upper letter";
    case "smallLetter":
      return "1 lower letter";
    case "numbers":
      return "1 number";
    default:
      return "8 symbols";
  }
};
