import { memo, useMemo } from "react";
import classNames from "clsx";
import { useAtomValue } from "jotai";

import { hasSeedPhraseAtom } from "app/atoms";
import { useSteps } from "app/hooks/steps";
import AddAccountHeader from "app/components/blocks/AddAccountHeader";

import { getWays } from "./ChooseAddAccountWay.Ways";

const ChooseAddAccountWay = memo(() => {
  const hasSeedPhrase = useAtomValue(hasSeedPhraseAtom);

  const stepsCtx = useSteps();
  const sections = useMemo(
    () => getWays(hasSeedPhrase, stepsCtx),
    [hasSeedPhrase, stepsCtx]
  );

  return (
    <div className="mb-8 w-full max-w-[59rem] mx-auto flex flex-wrap">
      <AddAccountHeader className="mb-11">Add wallet</AddAccountHeader>

      {sections
        .filter(({ type }) => type !== "advanced")
        .map((section, index) => (
          <div
            key={section.type}
            className={classNames(
              "w-1/3",
              "px-[1.75rem]",
              index % 3 !== 2 && "border-r border-brand-light/[.03]"
            )}
          >
            <h2 className={classNames("text-2xl font-bold capitalize", "mb-5")}>
              {section.title}
            </h2>

            {/*{section.points && (*/}
            {/*  <div className="mb-4 flex items-center text-sm text-gray-300">*/}
            {/*    <span className="mr-6">*/}
            {/*      Security: {section.points.security * 100}%*/}
            {/*    </span>*/}
            {/*    <span className="mr-6">*/}
            {/*      Adoption: {section.points.adoption * 100}%*/}
            {/*    </span>*/}
            {/*  </div>*/}
            {/*)}*/}

            <div className={classNames("flex flex-wrap items-stretch -mb-5")}>
              {section.tiles.map(({ title, Icon, action, soon }, i) => (
                <button
                  key={i}
                  className={classNames(
                    "relative",
                    "flex flex-col items-center",
                    "text-xs font-bold",
                    "mb-5",
                    i % 3 !== 2 && "mr-5",
                    "transition-transform",
                    !soon && "hover:scale-110 focus:scale-110",
                    !soon && "active:scale-95",
                    soon && "cursor-not-allowed"
                  )}
                  disabled={soon}
                  onClick={() => action()}
                >
                  {!!Icon && <Icon className="w-[4.5rem] h-[4.5rem] mb-1" />}
                  {soon && (
                    <span
                      className={classNames(
                        "py-1 px-2",
                        "rounded",
                        "bg-brand-main/30",
                        "border border-brand-main/50",
                        "shadow-addaccountmodal",
                        "text-xs font-medium",
                        "absolute",
                        "-top-3 -right-2"
                      )}
                    >
                      Soon
                    </span>
                  )}
                  {title}
                </button>
              ))}
            </div>
          </div>
        ))}
    </div>
  );
});

export default ChooseAddAccountWay;
