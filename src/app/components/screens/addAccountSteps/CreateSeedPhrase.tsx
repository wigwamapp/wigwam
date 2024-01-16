import { memo, useCallback, useEffect, useState } from "react";
import classNames from "clsx";
import { ethers } from "ethers";
import * as bip39 from "@scure/bip39";
import { wordlist as englishWordlist } from "@scure/bip39/wordlists/english";
import { getRandomBytes, toProtectedString } from "lib/crypto-utils";

import { SeedPharse } from "core/types";
import { validateSeedPhrase } from "core/common";

import { AddAccountStep } from "app/nav";
import { useDialog } from "app/hooks/dialog";
import { useSteps } from "app/hooks/steps";
import AddAccountHeader from "app/components/blocks/AddAccountHeader";
import AddAccountContinueButton from "app/components/blocks/AddAccountContinueButton";
import SeedPhraseWords from "app/components/blocks/SeedPhraseWords";
import { ReactComponent as BookmarkCheckIcon } from "app/icons/bookmark-check.svg";
import { ReactComponent as PencilLineIcon } from "app/icons/pencil-line.svg";
import { ReactComponent as AlertTriangleIcon } from "app/icons/alert-triangle.svg";
import { ReactComponent as ShieldOffIcon } from "app/icons/shield-off.svg";
import { ReactComponent as EyeOffIcon } from "app/icons/eye-off.svg";

const { toBeArray, dataSlice, keccak256, concat } = ethers;

const WORDS_LIST = [12, 24];

const CreateSeedPhrase = memo(() => {
  const { stateRef, navigateToStep } = useSteps();

  const [wordsCount] = useState(WORDS_LIST[0]);
  const [seedPhrase, setSeedPhrase] = useState<null | SeedPharse>();

  const { alert } = useDialog();

  const handleContinue = useCallback(async () => {
    try {
      if (!seedPhrase) {
        throw new Error("Not a valid secret phrase");
      }

      validateSeedPhrase(seedPhrase);

      stateRef.current.seedPhrase = seedPhrase;
      stateRef.current.seedPhraseWordsCount = wordsCount;

      navigateToStep(AddAccountStep.VerifySeedPhrase);
    } catch (err: any) {
      alert({ title: "Error", content: err?.message });
    }
  }, [seedPhrase, wordsCount, stateRef, navigateToStep, alert]);

  const generateNew = useCallback(() => {
    const entropySize = wordsCount === 12 ? 16 : 32;
    const baseEntropy = getRandomBytes(entropySize);
    const extraEntropy = getRandomBytes(entropySize);

    const entropy = toBeArray(
      dataSlice(keccak256(concat([baseEntropy, extraEntropy])), 0, entropySize),
    );

    const phraseText = bip39.entropyToMnemonic(entropy, englishWordlist);
    const seedPhrase: SeedPharse = {
      phrase: toProtectedString(phraseText),
      lang: "en",
    };

    setSeedPhrase(seedPhrase);
  }, [wordsCount]);

  useEffect(() => {
    setTimeout(generateNew, 0);
  }, [generateNew]);

  return (
    <>
      <AddAccountHeader className="mb-12">Secret Phrase</AddAccountHeader>

      <div
        className={classNames("w-full mx-auto max-w-4xl", "flex items-stretch")}
      >
        <div className="w-5/12 px-8 select-none">
          {CONTENT_ITEMS.map(({ Icon, text }, i) => (
            <div key={i} className={classNames("mb-10 flex items-center")}>
              <Icon className="w-8 h-auto mr-3 min-w-[2rem]" />
              <p className="text-sm font-medium text-brand-light">{text}</p>
            </div>
          ))}
        </div>
        <div className="w-7/12 px-8">
          {seedPhrase && <SeedPhraseWords seedPhrase={seedPhrase} />}
        </div>
      </div>

      <AddAccountContinueButton onContinue={handleContinue}>
        <BookmarkCheckIcon className="h-6 w-auto mr-2" />
        I’ve saved the phrase
      </AddAccountContinueButton>
    </>
  );
});

export default CreateSeedPhrase;

const CONTENT_ITEMS = [
  {
    Icon: PencilLineIcon,
    text: "Write down and store your Secret phrase in the a safe place",
  },
  {
    Icon: AlertTriangleIcon,
    text: "Your Secret phrase is the only way to recover your wallet",
  },
  {
    Icon: ShieldOffIcon,
    text: "Anyone with your Secret phrase can get full access to your wallet and funds",
  },
  {
    Icon: EyeOffIcon,
    text: "Never share your Secret phrase with anyone. Your wallet's security depends on keeping this detail private",
  },
] as const;
