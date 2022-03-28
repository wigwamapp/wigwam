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
  const { navigateToStep } = useSteps();
  const walletStatus = useAtomValue(walletStatusAtom);

  const methods = useMemo(
    () =>
      walletStatus === WalletStatus.Welcome ? methodsInitial : methodsExisting,
    [walletStatus]
  );

  const handleContinue = useCallback(
    (method: string) => {
      navigateToStep(
        method === methods[0].value
          ? AddAccountStep.SelectAccountsToAddMethod
          : AddAccountStep.VerifyToAdd
      );
    },
    [methods, navigateToStep]
  );

  return <SelectAddMethod methods={methods} onContinue={handleContinue} />;
};

export default SelectAccountsToAddMethod;
