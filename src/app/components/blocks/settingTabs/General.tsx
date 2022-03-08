import { FC, useMemo, useState } from "react";
import classNames from "clsx";
import { useAtom } from "jotai";
import { wordlists } from "@ethersproject/wordlists";
import * as SwitchPrimitive from "@radix-ui/react-switch";

import { currentLocaleAtom, tokensWithoutBalanceAtom } from "app/atoms";
import { toWordlistLang } from "core/common";
import { DEFAULT_LOCALES, FALLBACK_LOCALE } from "fixtures/locales";
import NewSelectLanguage from "../NewSelectLanguage";
import Select from "app/components/elements/Select";

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
      <NewSelectLanguage
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
        htmlFor="show"
      >
        Tokens without balance
      </label>
      <Switcher label="Show" toggle={show} setToggle={updateShow} />
    </div>
  );
};

interface SwitcherProps {
  label: string;
  toggle: boolean;
  setToggle: (update: boolean) => void;
  className?: string;
}
const Switcher: FC<SwitcherProps> = ({
  label,
  toggle,
  setToggle,
  className = "",
}) => {
  return (
    <div
      role="button"
      className={classNames(
        "flex items-center justify-between",
        "py-[9px] px-5",
        "bg-brand-main/10",
        "rounded-[.625rem]",
        className
      )}
      tabIndex={0}
      onKeyPress={() => 0}
      onClick={() => setToggle(!toggle)}
    >
      <h6 className="text-sm font-bold">{label}</h6>
      <SwitchPrimitive.Switch
        id="show"
        className={classNames(
          "relative",
          "w-[43px] h-[26px]",
          "bg-brand-main/20",
          "rounded-full",
          "[-webkit-tap-highlight-color: transparent]",
          "border border-brand-light",
          "[box-shadow: 0 0 0 2px white]"
        )}
        checked={toggle}
        onCheckedChange={setToggle}
      >
        <SwitchPrimitive.SwitchThumb
          className={classNames(
            "block",
            "w-[18px] h-[18px]",
            "bg-brand-white",
            "rounded-full",
            "bg-brand-light",
            "[box-shadow: 0 2px 2px #222222]",
            "duration-100 translate-x-[4px]",
            toggle && "translate-x-[20px]"
          )}
        />
      </SwitchPrimitive.Switch>
    </div>
  );
};
export default General;
