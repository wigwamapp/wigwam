import { FC } from "react";
import classNames from "clsx";

import NewButton from "app/components/elements/NewButton";

type AddAccountContinueButtonProps = {
  onContinue?: () => void;
  loading?: boolean;
};

const AddAccountContinueButton: FC<AddAccountContinueButtonProps> = ({
  onContinue,
  loading,
}) => (
  <div
    className={classNames(
      "z-20",
      "absolute bottom-0 left-1/2 -translate-x-1/2",
      "w-full h-24",
      "flex justify-center items-center",
      "mx-auto",
      "bg-brand-dark/20",
      "backdrop-blur-[10px]",
      "before:absolute before:top-0 before:left-1/2 before:-translate-x-1/2",
      "before:w-full before:max-w-[56.25rem] before:h-px",
      "before:bg-brand-main/[.07]"
    )}
  >
    <NewButton
      type={onContinue ? "button" : "submit"}
      className="!min-w-[14rem]"
      onClick={onContinue}
    >
      {loading ? "Loading..." : "Continue"}
    </NewButton>
  </div>
);

export default AddAccountContinueButton;
