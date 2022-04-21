import { FC, useMemo } from "react";
import { useAtom, useAtomValue } from "jotai";
import { setLocale } from "lib/ext/i18n";

import { DEFAULT_LOCALES, FALLBACK_LOCALE } from "fixtures/locales";
import {
  ConversionCurrency,
  CONVERSION_CURRENCIES,
} from "fixtures/conversionCurrency";

import {
  currentLocaleAtom,
  selectedCurrencyAtom,
  tokensWithoutBalanceAtom,
} from "app/atoms";
import Select from "app/components/elements/Select";
import Switcher from "app/components/elements/Switcher";
import SettingsHeader from "app/components/elements/SettingsHeader";
import SelectLanguage from "app/components/blocks/SelectLanguage";

const General: FC = () => {
  const currentLocale = useAtomValue(currentLocaleAtom);
  const [selectedCurrency, updateCurrency] = useAtom(selectedCurrencyAtom);
  const [showTokensWithoutBalance, toggleTokensWithoutBalance] = useAtom(
    tokensWithoutBalanceAtom
  );

  const locale = useMemo(
    () =>
      DEFAULT_LOCALES.find(({ code }) => currentLocale === code) ??
      FALLBACK_LOCALE,
    [currentLocale]
  );

  const currentItem = useMemo(
    () => ({
      key: selectedCurrency,
      value: `${selectedCurrency} - ${
        CONVERSION_CURRENCIES.find(
          (currency) => currency.code === selectedCurrency
        )?.name
      }`,
    }),
    [selectedCurrency]
  );
  const currencySelectProps = {
    items: CONVERSION_CURRENCIES.map(mapCurrency),
    currentItem,
    setItem: (item: any) => {
      const newCurrency = CONVERSION_CURRENCIES.find(
        (currency) => currency.code === item.key
      );
      if (newCurrency) {
        updateCurrency(item.key);
      }
    },
    showSelected: true,
    label: "Currency conversion",
  };

  return (
    <div className="flex flex-col items-start">
      <SettingsHeader>General</SettingsHeader>
      <SelectLanguage
        selected={locale}
        items={DEFAULT_LOCALES}
        onSelect={({ code }) => setLocale(code)}
        className="mb-3"
      />
      <Select {...currencySelectProps} className="mb-3" />
      <Switcher
        label="Tokens without balance"
        text={showTokensWithoutBalance ? "Visible" : "Hidden"}
        checked={showTokensWithoutBalance}
        onCheckedChange={toggleTokensWithoutBalance}
      />
    </div>
  );
};

export default General;

const mapCurrency = (currency: ConversionCurrency) => ({
  key: currency.code,
  value: `${currency.code} - ${currency.name}`,
});
