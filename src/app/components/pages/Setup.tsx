import { FC, Suspense, useCallback, useMemo } from "react";
import classNames from "clsx";
import { navigate, useLocation } from "woozie";
import ArrowCircleRightIcon from "@heroicons/react/solid/ArrowCircleRightIcon";

import { T } from "lib/ext/react";
import BoardingPageLayout from "app/components/layouts/BoardingPageLayout";
import LanguageStep from "app/components/blocks/LanguageStep";
import AddAccount from "app/components/blocks/AddAccount";

const Setup: FC = () => {
  const { search } = useLocation();
  const stepIndex = useMemo(() => {
    const value = new URLSearchParams(search).get("step");
    return value ? (JSON.parse(value) as number) : 0;
  }, [search]);

  const stepComponents = useMemo(() => [LanguageStep, AddAccount], []);

  const Component = stepComponents[stepIndex] ?? stepComponents[0];

  const handleContinue = useCallback(() => {
    navigate((l) => ({ ...l, search: `step=${stepIndex + 1}` }));
  }, [stepIndex]);

  return (
    <BoardingPageLayout title={null}>
      <Suspense fallback={null}>
        <Component />

        <div className="mt-24 flex items-center justify-center">
          <button
            className={classNames(
              "inline-flex items-center",
              "text-3xl",
              "text-gray-100",
              "transition ease-in-out duration-300",
              "animate-pulse hover:animate-none focus:animate-none"
            )}
            onClick={handleContinue}
          >
            <T i18nKey="continue" />
            <ArrowCircleRightIcon className="h-8 w-auto ml-4" />
          </button>
        </div>
      </Suspense>
    </BoardingPageLayout>
  );
};

export default Setup;
