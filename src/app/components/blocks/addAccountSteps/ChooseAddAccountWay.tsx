import { FC, memo, useMemo } from "react";
import classNames from "clsx";
import { useAtomValue } from "jotai";

import { hasSeedPhraseAtom } from "app/atoms";
import { useSteps } from "app/hooks/steps";
import { TippySingletonProvider } from "app/hooks";
import Collapse from "app/components/elements/Collapse";
import Tooltip from "app/components/elements/Tooltip";
import TooltipIcon from "app/components/elements/TooltipIcon";
import AddAccountHeader from "app/components/blocks/AddAccountHeader";

import { getWays, WaysReturnTile } from "./ChooseAddAccountWay.Ways";

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

      <TippySingletonProvider>
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
              <div className="flex items-center mb-5">
                <h2 className={classNames("text-2xl font-bold capitalize")}>
                  {section.title}
                </h2>
                {section.tooltip && (
                  <Tooltip
                    content={
                      <>
                        {section.tooltip.content}
                        {section.points && (
                          <Points
                            adoption={section.points.adoption}
                            security={section.points.security}
                          />
                        )}
                      </>
                    }
                    className="ml-2"
                  >
                    <TooltipIcon />
                  </Tooltip>
                )}
              </div>
              <div className={classNames("flex flex-wrap items-stretch -mb-5")}>
                {section.tiles.map(({ title, Icon, action, soon }, i) => (
                  <Tile
                    key={i}
                    title={title}
                    Icon={Icon}
                    action={action}
                    soon={soon}
                    className={classNames("mb-5", i % 3 !== 2 && "mr-5")}
                  />
                ))}
              </div>
            </div>
          ))}
      </TippySingletonProvider>

      {sections
        .filter(({ type }) => type === "advanced")
        .map((section, index) => (
          <Collapse
            key={index}
            label={section.title}
            className="mt-[4.25rem] mx-[1.75rem] w-full"
            triggerClassName="!mb-5"
          >
            <div className={classNames("flex flex-wrap items-stretch")}>
              {section.tiles.map(({ title, Icon, action, soon }, i) => (
                <Tile
                  key={i}
                  title={title}
                  Icon={Icon}
                  action={action}
                  soon={soon}
                  className="mr-5"
                />
              ))}
            </div>
          </Collapse>
        ))}
    </div>
  );
});

type TileProps = WaysReturnTile & {
  className?: string;
};

const Tile: FC<TileProps> = ({ title, Icon, action, soon, className }) => (
  <button
    className={classNames(
      "relative",
      "flex flex-col items-center",
      "text-xs font-bold",
      "max-w-[4.5rem]",
      "transition-transform",
      !soon && "hover:scale-110 focus-visible:scale-110",
      !soon && "active:scale-95",
      soon && "cursor-not-allowed",
      className
    )}
    disabled={soon}
    onClick={() => action()}
  >
    {!!Icon && <Icon className="w-[4.5rem] h-[4.5rem] mb-1" />}
    {soon && (
      <span
        className={classNames(
          "py-1 px-2",
          "rounded-md",
          "bg-brand-main/40",
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
);

type PointProps = {
  filled: number;
  style: "gray" | "green";
};

const Point: FC<PointProps> = ({ filled, style }) => (
  <div className="relative w-2 h-2 overflow-hidden rounded-[50%]">
    <div className="absolute t-0 w-2 h-2 border-solid border border-[#83819a] rounded-[50%]" />
    <div
      className={classNames(
        "absolute t-0",
        style === "green" ? "bg-[color:#4f9a5e]" : "bg-[#83819a]",
        "h-2"
      )}
      style={{ width: `${filled}%` }}
    />
  </div>
);

type PointsProps = {
  security: number;
  adoption: number;
};

const Points: FC<PointsProps> = ({ security, adoption }) => (
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

const absToZero = (n: number) => (n < 0 ? 0 : Math.abs(n));
const calcWidth = (n: number, idx: number) =>
  absToZero(n - idx * 0.2) > 0.2
    ? 100
    : absToZero(n - idx * 0.2) > 0
    ? (n - idx * 0.2) * 500
    : 0;

export default ChooseAddAccountWay;
