import { FC, useMemo } from "react";
import classNames from "clsx";
import { useAtom, useAtomValue } from "jotai";
import { setLocale } from "lib/ext/i18n";

import { DEFAULT_LOCALES, FALLBACK_LOCALE } from "fixtures/locales";

import { currentLocaleAtom, tokensWithoutBalanceAtom } from "app/atoms";
import Select from "app/components/elements/Select";
import Switcher from "app/components/elements/Switcher";
import SettingsHeader from "app/components/elements/SettingsHeader";
import SelectLanguage from "app/components/blocks/SelectLanguage";

const General: FC = () => {
  const currentLocale = useAtomValue(currentLocaleAtom);
  const [showTokensWithoutBalance, toggleTokensWithoutBalance] = useAtom(
    tokensWithoutBalanceAtom
  );

  const locale = useMemo(
    () =>
      DEFAULT_LOCALES.find(({ code }) => currentLocale === code) ??
      FALLBACK_LOCALE,
    [currentLocale]
  );

  const currencySelectProps = {
    items: [{ key: "usd", value: "USD ($)" }],
    currentItem: { key: "usd", value: "USD ($)" },
    setItem: (itemKey: any) => {
      currencySelectProps.currentItem = itemKey;
    },
    showSelected: true,
    label: "Primary fiat currency",
  };

  return (
    <div className={classNames("flex flex-col", "px-4")}>
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
