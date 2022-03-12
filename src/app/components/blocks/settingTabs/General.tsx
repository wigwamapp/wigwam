import { FC, useMemo, useState } from "react";
import classNames from "clsx";
import { useAtom } from "jotai";
import { wordlists } from "@ethersproject/wordlists";

import { currentLocaleAtom, tokensWithoutBalanceAtom } from "app/atoms";
import { toWordlistLang } from "core/common";
import { DEFAULT_LOCALES, FALLBACK_LOCALE } from "fixtures/locales";
import Select from "app/components/elements/Select";
import SelectLanguage from "app/components/blocks/SelectLanguage";
import Switcher from "app/components/elements/Switcher";

const SUPPORTED_LOCALES = DEFAULT_LOCALES.filter(
  ({ code }) => toWordlistLang(code) in wordlists
);
const General: FC = () => {
  const [currentLocale] = useAtom(currentLocaleAtom);
  const defaultLocale = useMemo(
    () =>
      SUPPORTED_LOCALES.find(({ code }) => currentLocale === code) ??
      FALLBACK_LOCALE,
    [currentLocale]
  );
  const [locale, setLocale] = useState(defaultLocale);

  const currencySelectProps = {
    items: [{ key: "usd", value: "USD ($)" }],
    currentItem: { key: "usd", value: "USD ($)" },
    setItem: (itemKey: any) => {
      currencySelectProps.currentItem = itemKey;
    },
    label: "Primary fiat currency",
  };

  const [show, updateShow] = useAtom(tokensWithoutBalanceAtom);

  return (
    <div className={classNames("flex flex-col", "px-4")}>
      <SelectLanguage
        selected={locale}
        items={SUPPORTED_LOCALES}
        onSelect={setLocale}
        className="mb-3"
      />
      <Select {...currencySelectProps} className="mb-3" />
      <label
        className={classNames(
          "ml-4 mb-2",
          "text-base font-normal",
          "text-brand-gray"
        )}
        htmlFor="Show"
      >
        Tokens without balance
      </label>
      <Switcher label="Show" toggle={show} setToggle={updateShow} />
    </div>
  );
};
export default General;
