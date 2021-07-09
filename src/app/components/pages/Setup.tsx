import { FC, Suspense, useCallback, useMemo } from "react";
import classNames from "clsx";
import { navigate } from "woozie";
import ArrowCircleRightIcon from "@heroicons/react/solid/ArrowCircleRightIcon";

import { T } from "lib/ext/react";
import BoardingPageLayout from "app/components/layouts/BoardingPageLayout";
import SelectGlobalLanguage from "app/components/blocks/setup/SelectGlobalLanguage";
import AddAccount from "app/components/blocks/account/AddAccount";

const Setup: FC<{ stepSlug: string | null }> = ({ stepSlug }) => {
  const [stepIndex, step] = useMemo(() => {
    const foundIndex = STEPS.findIndex(({ slug }) => stepSlug === slug);
    const index = foundIndex === -1 ? 0 : foundIndex;
    return [index, STEPS[index]];
  }, [stepSlug]);

  const { Component } = step;
  const last = stepIndex === STEPS.length - 1;

  const handleContinue = useCallback(() => {
    navigate(`/setup/${STEPS[stepIndex + 1].slug}`);
  }, [stepIndex]);

  return (
    <BoardingPageLayout title={null}>
      <div className="mb-24">
        <Suspense fallback={null}>
          <div className="mt-12">
            <Component />
          </div>

          {!last && (
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
          )}
        </Suspense>
      </div>
    </BoardingPageLayout>
  );
};

export default Setup;

const STEPS = [
  { slug: "language", Component: SelectGlobalLanguage },
  { slug: "add-account", Component: AddAccount },
];
