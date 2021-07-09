import { FC, useMemo } from "react";

import { DEFAULT_LOCALES, FALLBACK_LOCALE } from "fixtures/locales";
import { getLocale, setLocale } from "lib/ext/react";
import SelectLanguage from "app/components/blocks/SelectLanguage";

const SelectGlobalLanguage: FC = () => {
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
    </div>
  );
};

export default SelectGlobalLanguage;
