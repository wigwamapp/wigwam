import { FC, useCallback, useEffect, useMemo } from "react";
import { ethers } from "ethers";
import { useAtomValue } from "jotai";
import { useMaybeAtomValue } from "lib/atom-utils";
import { fromProtectedString } from "lib/crypto-utils";

import { SeedPharse, WalletStatus } from "core/types";
import {
  generatePreviewHDNodes,
  getSeedPhraseHDNode,
  toNeuterExtendedKey,
} from "core/common";
import { addAccounts } from "core/client";

import { AddAccountStep } from "app/nav";
import {
  hasSeedPhraseAtom,
  neuterExtendedKeyAtom,
  walletStatusAtom,
} from "app/atoms";
import { useSteps } from "app/hooks/steps";

import AccountsToAdd from "./AccountToAdd";

const tempAddresses = [
  {
    address: "0x01FBEA0D9116298382Aa22006EE766034d921a74",
    name: "Degen",
    isDisabled: true,
    isDefaultChecked: false,
  },
  {
    address: "0x297c523E096b7472527b7272dE0F75963B1caFaF",
    name: "Corporat",
    isDisabled: true,
    isDefaultChecked: true,
  },
  {
    address: "0xe30FC9Cd5219c20bE959Ee64F84915ee2EA975bf",
    isDisabled: true,
    isDefaultChecked: true,
  },
  {
    address: "0x873E4198Ab874C539caBd0c03c14d21C1c942574",
    name: "Prepared",
    isDisabled: false,
    isDefaultChecked: true,
  },
  {
    address: "0x8E6e772cAbd1c1e804916Ec806B2c6663AAc02b2",
    name: "Personal",
  },
  {
    address: "0x9d817fff8A8e556B51AEaA33C6172B805d6e7b9F",
  },
  {
    address: "0x3072508824A98E3966e422AE88f8625EeBbE66b8",
  },
  {
    address: "0x6DBB362aC14f9A499735F0a44838E9C157F36688",
  },
  {
    address: "0x3001e61f2C1E61e47Ad8571417b1D307908f6f5b",
  },
];

const rootDerivationPath = "m/44'/60'/0'/0";

const VerifyAccountToAdd: FC = () => {
  const walletStatus = useAtomValue(walletStatusAtom);
  const initialSetup = walletStatus === WalletStatus.Welcome;

  if (initialSetup) {
    return <VerifyAccountToAddInitial />;
  }

  return <VerifyAccountToAddExisting />;
};

export default VerifyAccountToAdd;

const VerifyAccountToAddInitial: FC = () => {
  const { stateRef, reset, navigateToStep } = useSteps();

  const seedPhrase: SeedPharse | undefined = stateRef.current.seedPhrase;

  const neuterExtendedKey = useMemo(() => {
    return seedPhrase
      ? toNeuterExtendedKey(getSeedPhraseHDNode(seedPhrase), rootDerivationPath)
      : null;
  }, [seedPhrase]);

  useEffect(() => {
    if (!neuterExtendedKey) {
      reset();
    }
  }, [neuterExtendedKey, reset]);

  const addresses = useMemo(
    () =>
      neuterExtendedKey
        ? generatePreviewHDNodes(neuterExtendedKey).map(({ address }) => ({
            address,
          }))
        : null,
    [neuterExtendedKey]
  );

  const handleContinue = useCallback(
    async (addAccountsParams) => {
      try {
        Object.assign(stateRef.current, { addAccountsParams });
        navigateToStep(AddAccountStep.SetupPassword);
      } catch (err) {
        console.error(err);
      }
    },
    [navigateToStep, stateRef]
  );

  if (!addresses) {
    return null;
  }

  return <AccountsToAdd addresses={addresses} onContinue={handleContinue} />;
};

const VerifyAccountToAddExisting: FC = () => {
  const hasSeedPhrase = useMaybeAtomValue(hasSeedPhraseAtom);
  const rootNeuterExtendedKey = useMaybeAtomValue(
    hasSeedPhrase && neuterExtendedKeyAtom
  );

  const { reset } = useSteps();

  const neuterExtendedKey = useMemo(() => {
    if (!rootNeuterExtendedKey) {
      return null;
    }

    const unprotectedKey = fromProtectedString(rootNeuterExtendedKey);

    return ethers.utils.HDNode.fromExtendedKey(unprotectedKey).derivePath(
      rootDerivationPath
    ).extendedKey;
  }, [rootNeuterExtendedKey]);

  useEffect(() => {
    if (!neuterExtendedKey) {
      reset();
    }
  }, [neuterExtendedKey, reset]);

  const addresses = useMemo(
    () =>
      neuterExtendedKey
        ? generatePreviewHDNodes(neuterExtendedKey).map(({ address }) => ({
            address,
          }))
        : null,
    [neuterExtendedKey]
  );

  const handleContinue = useCallback(async (addAccountsParams) => {
    try {
      await addAccounts(addAccountsParams);
    } catch (err) {
      console.error(err);
    }
  }, []);

  if (!addresses) {
    return null;
  }

  return <AccountsToAdd addresses={addresses} onContinue={handleContinue} />;
};
