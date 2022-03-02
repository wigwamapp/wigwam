import { memo, useCallback, useMemo } from "react";

import { FALLBACK_LOCALE, LocaleMeta } from "fixtures/locales";

import Select from "app/components/elements/Select";
import NewSelect from "../elements/NewSelect";

const prepareLanguage = (language: LocaleMeta) => ({
  key: language.code,
  value: language.name,
});

type NewSelectLanguageProps = {
  selected: LocaleMeta;
  items: LocaleMeta[];
  onSelect: (selected: LocaleMeta) => void;
  className?: string;
};

const NewSelectLanguage = memo<NewSelectLanguageProps>(
  ({ className, selected, items, onSelect }) => {
    const preparedLanguages = useMemo(
      () => items.map((language) => prepareLanguage(language)),
      [items]
    );

    const preparedCurrentLanguage = useMemo(
      () => prepareLanguage(selected),
      [selected]
    );

    const selectLanguage = useCallback(
      ({ key }) => {
        const locale =
          items.find(({ code }) => key === code) ?? FALLBACK_LOCALE;
        onSelect(locale);
      },
      [items, onSelect]
    );

    return (
      <NewSelect
        items={preparedLanguages}
        currentItem={preparedCurrentLanguage}
        setItem={selectLanguage}
        label="Language"
        showSelected
        className={className}
      />
    );
  }
);

export default NewSelectLanguage;
