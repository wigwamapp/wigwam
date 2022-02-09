import { FC, useMemo } from "react";
import { useAtomValue } from "jotai/utils";

import { setLocale } from "lib/ext/react";

import { DEFAULT_LOCALES, FALLBACK_LOCALE } from "fixtures/locales";
import { useSteps } from "app/hooks/steps";
import { WelcomeStep } from "app/defaults";
import { currentLocaleAtom } from "app/atoms";

import BoardingPageLayout from "../../layouts/BoardingPageLayout";
import SelectLanguage from "../SelectLanguage";
import ContinueButton from "../ContinueButton";

const ChooseLanguage: FC = () => {
  const currentLocale = useAtomValue(currentLocaleAtom);

  const { navigateToStep } = useSteps();

  const locale = useMemo(
    () =>
      DEFAULT_LOCALES.find(({ code }) => currentLocale === code) ??
      FALLBACK_LOCALE,
    [currentLocale]
  );

  return (
    <BoardingPageLayout header={false}>
      <div className="min-h-screen flex flex-col items-center justify-center">
        <SelectLanguage
          selected={locale}
          items={DEFAULT_LOCALES}
          onSelect={({ code }) => setLocale(code)}
          className="mt-24"
        />

        <ContinueButton onClick={() => navigateToStep(WelcomeStep.LetsBegin)} />
      </div>
    </BoardingPageLayout>
  );
};

export default ChooseLanguage;
