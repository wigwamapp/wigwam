import { FC, useMemo } from "react";

import { useSteps } from "lib/react-steps";
import { getLocale, setLocale } from "lib/ext/react";

import { DEFAULT_LOCALES, FALLBACK_LOCALE } from "fixtures/locales";
import SelectLanguage from "app/components/blocks/SelectLanguage";

import ContinueButton from "./ContinueButton";

const LanguageStep: FC = () => {
  const { navigateToStep } = useSteps();

  const locale = useMemo(() => {
    const currentCode = getLocale();
    return (
      DEFAULT_LOCALES.find(({ code }) => currentCode === code) ??
      FALLBACK_LOCALE
    );
  }, []);

  return (
    <div className="flex flex-col items-center justify-center">
      <SelectLanguage
        selected={locale}
        items={DEFAULT_LOCALES}
        onSelect={({ code }) => setLocale(code)}
        className="mt-24"
      />

      <ContinueButton onClick={() => navigateToStep("add-account")} />
    </div>
  );
};

export default LanguageStep;
