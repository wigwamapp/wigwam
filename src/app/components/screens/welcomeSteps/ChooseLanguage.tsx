import { FC, useMemo } from "react";
import { useAtomValue } from "jotai";

import { setLocale } from "lib/ext/react";

import { DEFAULT_LOCALES, FALLBACK_LOCALE } from "fixtures/locales";
import { useSteps } from "app/hooks/steps";
import { WelcomeStep } from "app/nav";
import { currentLocaleAtom } from "app/atoms";

import BoardingPageLayout from "app/components/layouts/BoardingPageLayout";
import SelectLanguage from "app/components/blocks/SelectLanguage";
import ContinueButton from "app/components/blocks/ContinueButton";

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
