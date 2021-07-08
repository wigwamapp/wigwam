import { memo, useMemo } from "react";
import { Listbox } from "@headlessui/react";

import { DEFAULT_LOCALES, FALLBACK_LOCALE } from "fixtures/locales";
import { T, getLocale, setLocale } from "lib/ext/react";
import ListboxWrapper from "app/components/layouts/ListboxWrapper";

const LanguageStep = memo(() => {
  const locale = useMemo(() => {
    const currentCode = getLocale();
    return (
      DEFAULT_LOCALES.find(({ code }) => currentCode === code) ??
      FALLBACK_LOCALE
    );
  }, []);

  return (
    <div className="mt-24 flex flex-col items-center justify-center">
      <ListboxWrapper
        value={locale}
        label={<T i18nKey="language" />}
        onChange={({ code }) => setLocale(code)}
        button={
          <Listbox.Button className="min-w-[16rem] cursor-default relative w-full border border-gray-100 pl-3 pr-10 py-2 text-left focus:outline-none focus:shadow-outline-blue focus:border-red-500 transition ease-in-out duration-150">
            <span className="block truncate">{locale.nativeName}</span>
            <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-200"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
              >
                <path
                  d="M7 7l3-3 3 3m0 6l-3 3-3-3"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </Listbox.Button>
        }
      >
        {DEFAULT_LOCALES.map((locale) => (
          <Listbox.Option key={locale.code} value={locale}>
            {({ selected, active }) => (
              <div
                className={`${
                  active
                    ? "text-white bg-red-600"
                    : "text-brand-darktext dark:text-white"
                } cursor-default select-none relative py-2 pl-8 pr-4`}
              >
                <span
                  className={`${
                    selected ? "font-semibold" : "font-normal"
                  } block truncate`}
                >
                  {locale.nativeName}
                </span>
                {selected && (
                  <span
                    className={`${
                      active ? "text-white" : "text-red-600"
                    } absolute inset-y-0 left-0 flex items-center pl-1.5`}
                  >
                    <svg
                      className="h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                )}
              </div>
            )}
          </Listbox.Option>
        ))}
      </ListboxWrapper>
    </div>
  );
});

export default LanguageStep;
