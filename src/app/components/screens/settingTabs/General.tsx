import { FC, useCallback, useMemo } from "react";
import { useAtom, useAtomValue } from "jotai";
import { setLocale } from "lib/ext/i18n";

import { DEFAULT_LOCALES, FALLBACK_LOCALE } from "fixtures/locales";
import {
  ConversionCurrency,
  CONVERSION_CURRENCIES,
} from "fixtures/conversionCurrency";

import { currentLocaleAtom, selectedCurrencyAtom } from "app/atoms";
import Select from "app/components/elements/Select";
import SettingsHeader from "app/components/elements/SettingsHeader";
import SelectLanguage from "app/components/blocks/SelectLanguage";
import classNames from "clsx";

const General: FC = () => {
  const currentLocale = useAtomValue(currentLocaleAtom);
  // const [showTokensWithoutBalance, toggleTokensWithoutBalance] = useAtom(
  //   tokensWithoutBalanceAtom
  // );

  const locale = useMemo(
    () =>
      DEFAULT_LOCALES.find(({ code }) => currentLocale === code) ??
      FALLBACK_LOCALE,
    [currentLocale]
  );

  return (
    <div className="flex flex-col items-start">
      <SettingsHeader>General</SettingsHeader>

      <SelectLanguage
        selected={locale}
        items={DEFAULT_LOCALES}
        onSelect={({ code }) => setLocale(code)}
        className="mb-3"
        tooltip={
          <>
            We are still working on interface text translation, but you can
            already use languages for localized dates and amount formats.
          </>
        }
        tooltipProps={{
          size: "large",
          placement: "right",
        }}
      />
      <SelectCurrency className="mb-3" />
      {/* <Switcher
        label="Tokens without balance"
        text={showTokensWithoutBalance ? "Visible" : "Hidden"}
        checked={showTokensWithoutBalance}
        onCheckedChange={toggleTokensWithoutBalance}
      /> */}
    </div>
  );
};

export default General;

const SelectCurrency: FC<{ className?: string }> = ({ className }) => {
  const [selectedCurrency, updateCurrency] = useAtom(selectedCurrencyAtom);

  const preparedCurrencies = useMemo(
    () =>
      CONVERSION_CURRENCIES.map((currency: ConversionCurrency) => ({
        key: currency.code,
        value: `${currency.code} - ${currency.name}`,
      })),
    []
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

  const handleSelectCurrency = useCallback(
    (item: { icon?: string; key: string; value: string }) => {
      const newCurrency = CONVERSION_CURRENCIES.find(
        (currency) => currency.code === item.key
      );
      if (newCurrency) {
        updateCurrency(item.key);
      }
    },
    [updateCurrency]
  );

  return (
    <Select
      label="Currency conversion"
      items={preparedCurrencies}
      currentItem={currentItem}
      setItem={handleSelectCurrency}
      showSelected={true}
      className={classNames("max-w-[17.75rem]", className)}
      contentClassName="max-w-[17.75rem]"
    />
  );
};
