import { FC, memo, useCallback, useEffect, useRef, useState } from "react";
import { useSetAtom } from "jotai";
import classNames from "clsx";
import * as Checkbox from "@radix-ui/react-checkbox";

import { AddAccountParams, SeedPharse } from "core/types";
import { setupWallet } from "core/client";

import { addAccountModalAtom } from "app/atoms";
import { useSteps } from "app/hooks/steps";
import Input from "app/components/elements/Input";
import IconedButton from "app/components/elements/IconedButton";
import AddAccountContinueButton from "app/components/blocks/AddAccountContinueButton";
import AddAccountHeader from "app/components/blocks/AddAccountHeader";
import { ReactComponent as EyeIcon } from "app/icons/eye.svg";
import { ReactComponent as OpenedEyeIcon } from "app/icons/opened-eye.svg";
import { ReactComponent as CheckIcon } from "app/icons/terms-check.svg";

const SetupPassword = memo(() => {
  const setAccModalOpened = useSetAtom(addAccountModalAtom);

  const { stateRef, reset } = useSteps();

  const [inputShowStates, setInputShowStates] = useState({
    first: false,
    second: false,
  });
  const [isAcceptedTerms, setIsAcceptedTerms] = useState(false);

  const addAccountsParams: AddAccountParams[] | undefined =
    stateRef.current.addAccountsParams;
  const seedPhrase: SeedPharse | undefined = stateRef.current.seedPhrase;

  useEffect(() => {
    if (!addAccountsParams) {
      reset();
    }
  }, [addAccountsParams, reset]);

  const passwordFieldRef = useRef<HTMLInputElement>(null);

  const handleFinish = useCallback(async () => {
    try {
      const password = passwordFieldRef.current?.value;

      if (!addAccountsParams || !password || !isAcceptedTerms) return;

      await setupWallet(password, addAccountsParams, seedPhrase);

      setAccModalOpened([false]);
    } catch (err: any) {
      alert(err?.message);
    }
  }, [addAccountsParams, isAcceptedTerms, seedPhrase, setAccModalOpened]);

  if (!addAccountsParams) {
    return null;
  }

  return (
    <>
      <AddAccountHeader className="mb-7">Setup Password</AddAccountHeader>

      <div className="max-w-[19rem] mx-auto flex flex-col items-center justify-center">
        <div className="w-full relative mb-3">
          <Input
            ref={passwordFieldRef}
            type={inputShowStates.first ? "text" : "password"}
            placeholder="Type password"
            label="New password"
            className="w-full"
          />
          <IconedButton
            Icon={inputShowStates.first ? EyeIcon : OpenedEyeIcon}
            theme="tertiary"
            aria-label={`${inputShowStates.first ? "Hide" : "Show"} password`}
            className="absolute bottom-2.5 right-3"
            onClick={() =>
              setInputShowStates((prevState) => ({
                ...prevState,
                first: !prevState.first,
              }))
            }
          />
        </div>
        <div className="w-full relative">
          <Input
            type={inputShowStates.second ? "text" : "password"}
            placeholder="Confirm Password"
            label="Confirm Password"
            className="w-full"
          />
          <IconedButton
            Icon={inputShowStates.second ? EyeIcon : OpenedEyeIcon}
            theme="tertiary"
            aria-label={`${inputShowStates.second ? "Hide" : "Show"} password`}
            className="absolute bottom-2.5 right-3"
            onClick={() =>
              setInputShowStates((prevState) => ({
                ...prevState,
                second: !prevState.second,
              }))
            }
          />
        </div>
        <AcceptTermsCheckbox
          checked={isAcceptedTerms}
          onCheckedChange={() => setIsAcceptedTerms(!isAcceptedTerms)}
          className="mt-6"
        />
      </div>

      <AddAccountContinueButton onContinue={handleFinish} />
    </>
  );
});

type AcceptTermsCheckboxProps = {
  checked: boolean;
  onCheckedChange: () => void;
  className?: string;
};

const AcceptTermsCheckbox: FC<AcceptTermsCheckboxProps> = ({
  checked,
  onCheckedChange,
  className,
}) => {
  return (
    <Checkbox.Root
      className={classNames(
        "w-full px-3 pt-2 pb-3",
        "rounded-[.625rem]",
        "bg-brand-main/[.05]",
        "flex",
        "transition-colors",
        "hover:bg-brand-main/[.1]",
        checked && "bg-brand-main/[.1]",
        className
      )}
      onCheckedChange={onCheckedChange}
    >
      <div
        className={classNames(
          "w-5 h-5 min-w-[1.25rem] mt-0.5 mr-4",
          "bg-brand-main/20",
          "rounded",
          "flex items-center justify-center",
          checked && "border border-brand-main"
        )}
      >
        <Checkbox.Indicator>{checked && <CheckIcon />}</Checkbox.Indicator>
      </div>
      <div className="text-left">
        <h3 className="text-brand-light text-base font-semibold">
          Accept terms
        </h3>
        <p className="text-brand-inactivedark2 text-sm">
          I have read and agree to the Terms of Usage and Privacy Policy
        </p>
      </div>
    </Checkbox.Root>
  );
};

export default SetupPassword;
