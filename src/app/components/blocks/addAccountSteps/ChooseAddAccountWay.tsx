import { memo, useMemo } from "react";
import classNames from "clsx";
import { useAtomValue } from "jotai";

import { hasSeedPhraseAtom } from "app/atoms";
import { useSteps } from "app/hooks/steps";
import AddAccountHeader from "app/components/blocks/AddAccountHeader";
import Tooltip from "app/components/elements/Tooltip";
import { ReactComponent as TooltipIcon } from "app/icons/tooltip.svg";

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
            <div className="flex">
              <h2
                className={classNames("text-2xl font-bold capitalize", "mb-5")}
              >
                {section.title}
              </h2>
              {!!section.tooltip && (
                <Tooltip
                  TooltipIcon={TooltipIcon}
                  theme="primary"
                  ariaLabel="lorem ipsum"
                >
                  {section.tooltip.content}
                  {section.points && (
                    <Points
                      security={section.points.security}
                      adoption={section.points.adoption}
                    />
                  )}
                </Tooltip>
              )}
            </div>
            <Points
              security={section.points?.security ?? 0.7}
              adoption={section.points?.adoption ?? 0.88}
            />

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
                  key={title}
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

interface PointProps {
  filled: number;
  style: "gray" | "green";
}
const Point: React.FC<PointProps> = ({ filled, style }) => (
  <div className="relative w-2 h-2 overflow-hidden rounded-[50%]">
    <div className="absolute t-0 w-2 h-2 border-solid border border-[#83819a] rounded-[50%]"></div>
    <div
      className={classNames(
        "absolute t-0",
        style === "green" ? "bg-[color:#4f9a5e]" : "bg-[#83819a]",
        "h-2"
      )}
      style={{ width: `${filled}%` }}
    ></div>
  </div>
);
interface PointsProps {
  security: number;
  adoption: number;
}
const absToZero = (n: number) => (n < 0 ? 0 : Math.abs(n));
const calcWidth = (n: number, idx: number) =>
  absToZero(n - idx * 0.2) > 0.2
    ? 100
    : absToZero(n - idx * 0.2) > 0
    ? (n - idx * 0.2) * 500
    : 0;
const Points: React.FC<PointsProps> = ({ security, adoption }) => (
  <div className="mt-4">
    <div
      className={classNames("w-[125px]", "flex items-center justify-between")}
    >
      <span className="w-10 text-brand-gray">Security:</span>
      <div
        className={classNames(
          "w-[56px] ml-5",
          "overflow-hidden whitespace-nowrap",
          "flex justify-between"
        )}
      >
        <Point filled={calcWidth(security, 0)} style="gray" />
        <Point filled={calcWidth(security, 1)} style="gray" />
        <Point filled={calcWidth(security, 2)} style="gray" />
        <Point filled={calcWidth(security, 3)} style="gray" />
        <Point filled={calcWidth(security, 4)} style="gray" />
      </div>
    </div>
    <div
      className={classNames("w-[125px]", "flex items-center justify-between")}
    >
      <span className="w-10 text-brand-gray">Adoption:</span>

      <div
        className={classNames(
          "w-[56px] ml-5",
          "overflow-hidden whitespace-nowrap",
          "flex justify-between"
        )}
      >
        <Point filled={calcWidth(adoption, 0)} style="green" />
        <Point filled={calcWidth(adoption, 1)} style="green" />
        <Point filled={calcWidth(adoption, 2)} style="green" />
        <Point filled={calcWidth(adoption, 3)} style="green" />
        <Point filled={calcWidth(adoption, 4)} style="green" />
      </div>
    </div>
  </div>
);

export default ChooseAddAccountWay;
