import { FC, memo, useCallback, useMemo } from "react";
import classNames from "clsx";
import { useAtom, useAtomValue } from "jotai";
import { setLocale } from "lib/ext/i18n";
import { restartApp } from "lib/ext/utils";

import { DEFAULT_LOCALES, FALLBACK_LOCALE } from "fixtures/locales";
import {
  ConversionCurrency,
  CONVERSION_CURRENCIES,
} from "fixtures/conversionCurrency";

import {
  currentLocaleAtom,
  updateAvailableAtom,
  latestVersionAtom,
  selectedCurrencyAtom,
} from "app/atoms";
import { useDialog } from "app/hooks/dialog";
import SelectLanguage from "app/components/blocks/SelectLanguage";
import Select from "app/components/elements/Select";
import SettingsHeader from "app/components/elements/SettingsHeader";
import Separator from "app/components/elements/Seperator";
import Button from "app/components/elements/Button";
import { ReactComponent as RevealIcon } from "app/icons/reveal.svg";

const General: FC = () => {
  const currentLocale = useAtomValue(currentLocaleAtom);
  const updateAvailable = useAtomValue(updateAvailableAtom);
  // const [showTokensWithoutBalance, toggleTokensWithoutBalance] = useAtom(
  //   tokensWithoutBalanceAtom
  // );

  const locale = useMemo(
    () =>
      DEFAULT_LOCALES.find(({ code }) => currentLocale === code) ??
      FALLBACK_LOCALE,
    [currentLocale],
  );

  return (
    <div className="flex flex-col items-start">
      {updateAvailable && <SoftwareUpdate />}

      <SettingsHeader>General</SettingsHeader>

      <SelectLanguage
        selected={locale}
        items={DEFAULT_LOCALES}
        onSelect={({ code }) => setLocale(code)}
        className="mb-3"
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
    [],
  );

  const currentItem = useMemo(
    () => ({
      key: selectedCurrency,
      value: `${selectedCurrency} - ${
        CONVERSION_CURRENCIES.find(
          (currency) => currency.code === selectedCurrency,
        )?.name
      }`,
    }),
    [selectedCurrency],
  );

  const handleSelectCurrency = useCallback(
    (item: { icon?: string; key: string; value: string }) => {
      const newCurrency = CONVERSION_CURRENCIES.find(
        (currency) => currency.code === item.key,
      );
      if (newCurrency) {
        updateCurrency(item.key);
      }
    },
    [updateCurrency],
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

const SoftwareUpdate = memo(() => {
  const latestVersion = useAtomValue(latestVersionAtom);
  const { confirm } = useDialog();

  const handleUpdate = useCallback(async () => {
    try {
      const confirmed = await confirm({
        title: "Software Update",
        content: (
          <ul className="text-left list-disc">
            <li className="mb-2">
              Are you sure you want to restart the app now and update it to the
              newer version?
            </li>

            <li>
              Make sure you remember your profile password, and that you have a
              backup of the Secret Phrases used in all profiles, as well as
              other private keys if any are used.
            </li>
          </ul>
        ),
        yesButtonText: "Restart",
      });

      if (confirmed) {
        await restartApp();
      }
    } catch (err) {
      console.error(err);
    }
  }, [confirm]);

  return (
    <>
      <SettingsHeader className="flex items-center">
        Software Update
        <div className="ml-1.5 h-7">
          <div className={classNames("w-2 h-2", "bg-activity rounded-full")} />
        </div>
      </SettingsHeader>

      <p className="mb-6 text-sm text-brand-font max-w-[30rem]">
        An update is available for your Wigwam.
        <br />
        Version:{" "}
        <span className="font-mono text-brand-inactivelight font-bold">
          {latestVersion}
        </span>
      </p>

      <Button
        theme="secondary"
        className={classNames(
          "mb-6 flex !justify-start items-center",
          "text-left",
          "!px-3 !py-2 mr-auto",
        )}
        onClick={handleUpdate}
      >
        <RevealIcon className="w-[1.625rem] h-auto mr-3" />
        Restart now
      </Button>

      <Separator className="mb-8" />
    </>
  );
});
