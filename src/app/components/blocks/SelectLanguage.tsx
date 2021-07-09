import { memo } from "react";
import classNames from "clsx";
import { Listbox } from "@headlessui/react";

import { LocaleMeta } from "fixtures/locales";
import { T } from "lib/ext/react";
import ListboxWrapper from "app/components/layouts/ListboxWrapper";

type SelectLanguageProps = {
  selected: LocaleMeta;
  items: LocaleMeta[];
  onSelect: (selected: LocaleMeta) => void;
  className?: string;
};

const SelectLanguage = memo<SelectLanguageProps>(
  ({ className, selected, items, onSelect }) => (
    <ListboxWrapper
      value={selected}
      label={<T i18nKey="language" />}
      onChange={onSelect}
      button={
        <Listbox.Button
          className={classNames(
            "min-w-[16rem] cursor-default relative w-full border border-gray-100 pl-3 pr-10 py-2 text-left focus:outline-none focus:shadow-outline-blue focus:border-red-500 transition ease-in-out duration-150",
            className
          )}
        >
          <span className="block truncate">{selected.nativeName}</span>
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
      {items.map((locale) => (
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
  )
);

export default SelectLanguage;
