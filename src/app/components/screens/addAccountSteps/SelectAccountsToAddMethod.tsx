import { FC, useCallback, useMemo } from "react";
import { useAtomValue } from "jotai";

import { WalletStatus } from "core/types";

import { walletStatusAtom } from "app/atoms";
import { AddAccountStep } from "app/nav";
import { useSteps } from "app/hooks/steps";

import SelectAddMethod, { MethodsProps } from "./SelectAddMethod";

const methodsInitial: MethodsProps = [
  {
    value: "auto",
    title: "Auto (Recommended)",
    description:
      "Scanning the first 20 wallets from Secret Phrase for a positive balance. For every known network (mainnet). If you have more wallets - you can also add them later.",
  },
  {
    value: "manual",
    title: "Manual",
    description:
      "Choose which of the wallets belonging to the Secret Phrase you wish to add.",
  },
];

const methodsExisting: MethodsProps = [
  {
    value: "create",
    title: "Create new account",
    description: "You can create a new account",
  },
  {
    value: "manual",
    title: "Manual adding account",
    description:
      "Choose which of the wallets belonging to the Secret Phrase you wish to add.",
  },
];

const SelectAccountsToAddMethod: FC = () => {
  const { navigateToStep, stateRef } = useSteps();
  const walletStatus = useAtomValue(walletStatusAtom);

  const isInitial = walletStatus === WalletStatus.Welcome;

  const methods = useMemo(
    () => (isInitial ? methodsInitial : methodsExisting),
    [isInitial]
  );

  const handleContinue = useCallback(
    (method: string) => {
      if (!isInitial) {
        stateRef.current.addAccounts = `existing-${method}`;
      }
      navigateToStep(AddAccountStep.VerifyToAdd);
    },
    [isInitial, navigateToStep, stateRef]
  );

  return <SelectAddMethod methods={methods} onContinue={handleContinue} />;
};

export default SelectAccountsToAddMethod;
