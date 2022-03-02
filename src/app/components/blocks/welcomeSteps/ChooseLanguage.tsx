import { FC, useMemo } from "react";
import { useAtomValue } from "jotai";

import { setLocale } from "lib/ext/react";

import { DEFAULT_LOCALES, FALLBACK_LOCALE } from "fixtures/locales";
import { useSteps } from "app/hooks/steps";
import { WelcomeStep } from "app/defaults";
import { currentLocaleAtom } from "app/atoms";

import BoardingPageLayout from "../../layouts/BoardingPageLayout";
import SelectLanguage from "../SelectLanguage";
import ContinueButton from "../ContinueButton";
import TooltipIcon from "../../elements/TooltipIcon";
import HoverCard from "../../elements/HoverCard";
import NewTooltip from "../../elements/NewTooltip";

const ChooseLanguage: FC = () => {
  const currentLocale = useAtomValue(currentLocaleAtom);

  const { navigateToStep } = useSteps();

  const locale = useMemo(
    () =>
      DEFAULT_LOCALES.find(({ code }) => currentLocale === code) ??
      FALLBACK_LOCALE,
    [currentLocale]
  );

  return (
    <BoardingPageLayout header={false}>
      <div className="min-h-screen flex flex-col items-center justify-center">
        <SelectLanguage
          selected={locale}
          items={DEFAULT_LOCALES}
          onSelect={({ code }) => setLocale(code)}
          className="mt-24"
        />
        <NewTooltip
          content={
            <>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit ut
                aliquam, purus sit amet luctus venenatis, lectus magna fringilla
                urna, porttitor rhoncus dolor purus non enim praesent elementum
                facilisis leo
              </p>
              <p className="mt-2">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit ut
                aliquam, purus sit amet luctus venenatis, lectus magna fringilla
                urna, porttitor rhoncus
              </p>
            </>
          }
          className="mr-3"
        >
          <TooltipIcon />
        </NewTooltip>

        <ContinueButton onClick={() => navigateToStep(WelcomeStep.LetsBegin)} />
      </div>
    </BoardingPageLayout>
  );
};

export default ChooseLanguage;
