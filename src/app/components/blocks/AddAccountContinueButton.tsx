import { FC, PropsWithChildren } from "react";
import classNames from "clsx";

import { IS_FIREFOX } from "app/defaults";
import Button from "app/components/elements/Button";

type AddAccountContinueButtonProps = {
  onContinue?: () => void;
  loading?: boolean;
};

const AddAccountContinueButton: FC<
  PropsWithChildren<AddAccountContinueButtonProps>
> = ({ onContinue, loading, children = "Continue" }) => (
  <div
    className={classNames(
      "z-20",
      "absolute bottom-0 left-1/2 -translate-x-1/2",
      "w-full h-24",
      "flex justify-center items-center",
      "mx-auto",
      "bg-brand-dark/20",
      "backdrop-blur-[10px]",
      IS_FIREFOX && "!bg-addaccountcontinue",
      "before:absolute before:top-0 before:left-1/2 before:-translate-x-1/2",
      "before:w-full before:max-w-[56.25rem] before:h-px",
      "before:bg-brand-main/[.07]",
    )}
  >
    <Button
      type={onContinue ? "button" : "submit"}
      className="!min-w-[14rem]"
      onClick={onContinue}
      loading={loading}
    >
      {children}
    </Button>
  </div>
);

export default AddAccountContinueButton;
