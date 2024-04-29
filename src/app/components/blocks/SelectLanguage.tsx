import { memo, ReactNode, useCallback, useMemo } from "react";

import { FALLBACK_LOCALE, LocaleMeta } from "fixtures/locales";

import Select from "app/components/elements/Select";
import { TooltipProps } from "app/components/elements/Tooltip";

const prepareLanguage = (language: LocaleMeta) => ({
  key: language.code,
  value: language.name,
});

type SelectLanguageProps = {
  selected: LocaleMeta;
  items: LocaleMeta[];
  onSelect: (selected: LocaleMeta) => void;
  tooltip?: ReactNode;
  tooltipProps?: TooltipProps;
  className?: string;
};

const SelectLanguage = memo<SelectLanguageProps>(
  ({ className, selected, items, onSelect, ...rest }) => {
    const preparedLanguages = useMemo(
      () => items.map((language) => prepareLanguage(language)),
      [items],
    );

    const preparedCurrentLanguage = useMemo(
      () => prepareLanguage(selected),
      [selected],
    );

    const selectLanguage = useCallback(
      ({ key }: { key: string }) => {
        const locale =
          items.find(({ code }) => key === code) ?? FALLBACK_LOCALE;
        onSelect(locale);
      },
      [items, onSelect],
    );

    return (
      <Select
        items={preparedLanguages}
        currentItem={preparedCurrentLanguage}
        setItem={selectLanguage}
        label="Currency format"
        showSelected
        className={className}
        tooltip={
          <>You can use different formats for localised dates and amounts.</>
        }
        tooltipProps={{
          size: "large",
          placement: "right",
        }}
        {...rest}
      />
    );
  },
);

export default SelectLanguage;
