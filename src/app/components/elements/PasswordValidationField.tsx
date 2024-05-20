import {
  FC,
  forwardRef,
  useCallback,
  useState,
  ChangeEventHandler,
} from "react";
import classNames from "clsx";

import { InputProps } from "./Input";
import PasswordField from "./PasswordField";

type RequirementsType =
  | "bigLetter"
  | "smallLetter"
  | "numbers"
  | "length"
  | "characters";

const PasswordValidationField = forwardRef<
  HTMLInputElement,
  Omit<InputProps, "ref" | "type" | "actions"> & {
    modified?: boolean;
  }
>(({ className, onChange, modified = false, ...rest }, ref) => {
  const [passwordRequirements, setPasswordRequirements] = useState<
    Record<RequirementsType, boolean>
  >({
    bigLetter: false,
    smallLetter: false,
    numbers: false,
    length: false,
    characters: false,
  });

  const handleInputChange = useCallback<ChangeEventHandler<HTMLInputElement>>(
    (evt) => {
      const { value } = evt.target;

      setPasswordRequirements({
        bigLetter: /(?=.*[A-Z])/.test(value),
        smallLetter: /(?=.*[a-z])/.test(value),
        numbers: /(?=.*[0-9])/.test(value),
        length: value.length >= 8,
        characters: /[`!@#$%^&*()_+\-=\[\]{};':\"\\|,.<>\/?~]/.test(value),
      });

      onChange?.(evt);
    },
    [onChange],
  );

  return (
    <div className={classNames("flex flex-col", className)}>
      <PasswordField ref={ref} onChange={handleInputChange} {...rest} />
      <div
        className={classNames(
          "flex flex-wrap",
          "mt-2 pl-2 -mb-2",
          "max-h-0 overflow-hidden",
          "transition-[max-height] duration-200",
          (modified || rest.error) && "max-h-[4rem]",
        )}
      >
        {Object.keys(passwordRequirements).map((key) => (
          <Tag
            key={key}
            type={key as RequirementsType}
            isActive={passwordRequirements[key as RequirementsType]}
            isOptional={key === "characters"}
            isError={Boolean(
              !passwordRequirements[key as RequirementsType] && rest.error,
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
  isOptional: boolean;
  isError: boolean;
  className?: string;
};

const Tag: FC<TagProps> = ({
  type,
  isActive = false,
  isOptional = false,
  isError = false,
  className,
}) => (
  <span
    className={classNames(
      "flex items-center justify-center",
      "px-2 py-[.1875rem]",
      "rounded-md",
      "text-xs",
      "mr-2 mb-2",
      "transition-colors",
      "border",
      !isActive && [
        "border-brand-main/5 text-brand-inactivedark",
        !isOptional && "bg-brand-main/5",
      ],
      isActive &&
        !isError &&
        "border-[#08923F]/20 bg-[#08923F]/20 text-[#28B048]",
      isError &&
        (isOptional
          ? ""
          : "border-brand-redtext/20 bg-brand-redtext/20 text-brand-redtext"),
      className,
    )}
  >
    {getLabel(type)}
  </span>
);

const getLabel = (key: RequirementsType) => {
  switch (key) {
    case "bigLetter":
      return "1 upper letter";
    case "smallLetter":
      return "1 lower letter";
    case "numbers":
      return "1 number";
    case "length":
      return "8 symbols";
    default:
      return "special characters";
  }
};
